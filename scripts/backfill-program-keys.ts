// Membuat secret key untuk semua program AKTIF yang belum punya key
// (mis. program lama hasil migrasi), lalu menyimpan key aslinya ke file CSV.
//
// PERHATIAN: key asli hanya ada di file CSV ini. Database hanya menyimpan hash-nya.
// Bagikan ke tiap tim lewat jalur aman, lalu HAPUS file CSV-nya.
//
// Jalankan: npm run db:backfill-keys
import "dotenv/config";
import { writeFileSync } from "node:fs";
import { prisma } from "@/infrastructure/prisma/client";
import { NodeProgramKeyService } from "@/infrastructure/security/node-program-key.service";

const keys = new NodeProgramKeyService();

async function main() {
  const programs = await prisma.program.findMany({
    where: { secret_key_hash: null, deleted_at: null },
    select: { id: true, program_name: true },
    orderBy: { id: "asc" },
  });

  if (programs.length === 0) {
    console.log("Semua program aktif sudah punya secret key. Tidak ada yang dikerjakan.");
    return;
  }

  const rows: (string | number)[][] = [["program_id", "program_name", "secret_key"]];
  for (const p of programs) {
    const key = keys.generate();
    await prisma.program.update({
      where: { id: p.id },
      data: { secret_key_hash: key.hash, secret_key_prefix: key.prefix, secret_key_generated_at: new Date() },
    });
    rows.push([p.id, `"${p.program_name.replaceAll('"', '""')}"`, key.secret]);
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const file = `program-keys-${stamp}.csv`;
  writeFileSync(file, rows.map((r) => r.join(",")).join("\n") + "\n", { mode: 0o600 });
  console.log(`✔ ${programs.length} secret key dibuat. Key asli disimpan di: ${file}`);
  console.log("  Bagikan ke masing-masing tim, lalu hapus file tersebut.");
}

main().finally(() => prisma.$disconnect());
