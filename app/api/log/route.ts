import db from "@/lib/db";
import { LOG_CATEGORIES, LOG_LEVELS, categoryFromTypeName } from "@/lib/log-category";
import { insertLogs, type NewLog } from "@/lib/log-store";
import { findProgramByKey } from "@/lib/program-key";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 1_000_000;
const MAX_BATCH = 100;
const MAX_METADATA_BYTES = 8_000;

// Pembatas sederhana per program. Disimpan di memori proses: cukup untuk satu instance;
// jika nanti dijalankan di banyak instance, pindahkan ke Redis/database.
const WINDOW_MS = 60_000;
const MAX_ENTRIES_PER_WINDOW = 1_000;
const usage = new Map<number, { windowStart: number; count: number }>();

function consume(programId: number, n: number): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  const cur = usage.get(programId);
  if (!cur || now - cur.windowStart >= WINDOW_MS) {
    usage.set(programId, { windowStart: now, count: n });
    return { ok: true };
  }
  if (cur.count + n > MAX_ENTRIES_PER_WINDOW) {
    return { ok: false, retryAfter: Math.ceil((cur.windowStart + WINDOW_MS - now) / 1000) };
  }
  cur.count += n;
  return { ok: true };
}

// metadata sengaja datar (nilai primitif) supaya mudah ditampilkan & dicari.
const metadataSchema = z
  .record(
    z.string().max(60),
    z.union([z.string().max(1000), z.number(), z.boolean(), z.null()], {
      error: "nilai metadata harus string (maks 1000), angka, boolean, atau null (tidak boleh objek/array)",
    })
  )
  .refine((m) => JSON.stringify(m).length <= MAX_METADATA_BYTES, {
    message: `metadata terlalu besar (maks ${MAX_METADATA_BYTES} karakter)`,
  });

const text = (max: number) => z.string().trim().max(max).optional();

const entrySchema = z.object({
  category: z.enum(LOG_CATEGORIES).optional(),
  level: z.enum(LOG_LEVELS).default("info"),
  // Nama kejadian; disimpan di kolom *_method_name kecuali `method_name` diisi.
  action: z.string().trim().min(1, "action wajib diisi").max(100),
  message: z.string().max(4000).optional(),
  actor: text(100),
  ip_address: text(45),
  device: text(150),
  app_version: text(50),
  occurred_at: z.iso.datetime({ offset: true }).optional(),
  metadata: metadataSchema.optional(),

  // Field opsional yang cocok langsung dengan kolom tabel log_*.
  application: text(100),
  module: text(150),
  form_name: text(150),
  method_name: text(150),
  correlation_id: z.guid().optional(),
  transaction_no: text(100),
  station_id: text(100),
  device_id: text(150),
  device_type: text(50),
  device_merk: text(100),
  branch_code: text(20),
  store_code: text(20),
  os_version: text(150),
  thread_id: text(50),
  execution_time_ms: z.number().int().min(0).max(2_147_483_647).optional(),
  exception_message: z.string().max(8000).optional(),
  stack_trace: z.string().max(20_000).optional(),
});

const batchSchema = z.array(entrySchema).min(1).max(MAX_BATCH);

function fail(status: number, error: string, headers?: Record<string, string>) {
  return NextResponse.json({ ok: false, error }, { status, headers });
}

export async function POST(request: Request) {
  // 1) Autentikasi dulu (murah), baru baca body.
  const program = await findProgramByKey(request.headers.get("x-program-key"));
  if (!program) return fail(401, "Unauthorized");

  // 2) Batasi ukuran body.
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) return fail(413, "Body terlalu besar.");
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return fail(413, "Body terlalu besar.");

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return fail(400, "Body bukan JSON yang valid.");
  }

  // Dicabangkan (bukan z.union) supaya pesan error menunjuk field yang salah.
  const parsed = Array.isArray(json) ? batchSchema.safeParse(json) : entrySchema.safeParse(json);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const where = issue.path.length ? ` (${issue.path.join(".")})` : "";
    return fail(422, `${issue.message}${where}`);
  }
  const entries = Array.isArray(parsed.data) ? parsed.data : [parsed.data];

  // 3) Pembatasan laju per program.
  const limit = consume(program.id, entries.length);
  if (!limit.ok) {
    return fail(429, "Terlalu banyak log. Coba lagi sebentar.", {
      "Retry-After": String(limit.retryAfter),
    });
  }

  // 4) Tentukan kategori: dari body, jika tidak ada diturunkan dari tipe program.
  let fallback: ReturnType<typeof categoryFromTypeName> = null;
  if (entries.some((e) => !e.category)) {
    const type = await db.programType.findUnique({
      where: { id: program.program_type_id },
      select: { program_type: true },
    });
    fallback = categoryFromTypeName(type?.program_type);
    if (!fallback) {
      return fail(
        422,
        `category wajib diisi (${LOG_CATEGORIES.join(" | ")}); tipe program tidak bisa dipetakan otomatis.`
      );
    }
  }

  const now = new Date();
  const futureLimit = now.getTime() + 5 * 60_000; // toleransi selisih jam 5 menit

  const items = entries.map((e) => {
    const occurred = e.occurred_at ? new Date(e.occurred_at) : now;
    const metaDuration = typeof e.metadata?.duration_ms === "number" ? Math.round(e.metadata.duration_ms) : undefined;
    const metaOs = typeof e.metadata?.os === "string" ? e.metadata.os.slice(0, 150) : undefined;

    const log: NewLog = {
      occurredAt: occurred.getTime() > futureLimit ? now : occurred,
      level: e.level,
      correlationId: e.correlation_id,
      application: e.application ?? program.program_name.slice(0, 100),
      module: e.module,
      formName: e.form_name,
      methodName: e.method_name ?? e.action,
      userId: e.actor,
      stationId: e.station_id,
      deviceId: e.device_id ?? e.device,
      deviceType: e.device_type,
      deviceMerk: e.device_merk,
      branchCode: e.branch_code,
      storeCode: e.store_code,
      transactionNo: e.transaction_no,
      programId: String(program.id),
      message: e.message,
      methodArguments: e.metadata,
      executionTimeMs: e.execution_time_ms ?? metaDuration,
      exceptionMessage: e.exception_message,
      stackTrace: e.stack_trace,
      machineName: e.device,
      ipAddress: e.ip_address,
      osVersion: e.os_version ?? metaOs,
      appVersion: e.app_version,
      threadId: e.thread_id,
      createdBy: program.program_name.slice(0, 100),
    };
    return { category: e.category ?? fallback!, log };
  });

  let received: number;
  try {
    received = await insertLogs(items);
  } catch (err) {
    console.error("[api/log] gagal menyimpan log:", err);
    return fail(500, "Gagal menyimpan log.");
  }

  return NextResponse.json({ ok: true, received }, { status: 201 });
}
