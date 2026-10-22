// POST /api/log: endpoint penerima log dari program. Lapisan ini hanya mengurus HTTP
// (autentikasi header, batas ukuran, validasi bentuk body, kode status). Aturan bisnisnya
// ada di use case IngestLogs.

import { LOG_CATEGORIES, LOG_LEVELS } from "@/domain/log/log-category";
import { container } from "@/infrastructure/container";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 1_000_000;
const MAX_BATCH = 100;
const MAX_METADATA_BYTES = 8_000;

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
  const program = await container.authenticateProgramKey.execute(request.headers.get("x-program-key"));
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

  // 3) Jalankan use case, lalu terjemahkan hasilnya ke HTTP.
  const result = await container.ingestLogs.execute(program, entries);
  if (result.ok) return NextResponse.json({ ok: true, received: result.received }, { status: 201 });

  switch (result.code) {
    case "rate_limited":
      return fail(429, result.error, { "Retry-After": String(result.retryAfter) });
    case "category_required":
      return fail(422, result.error);
    case "storage_failed":
      return fail(500, result.error);
  }
}
