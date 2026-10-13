// Membuat secret key untuk semua program AKTIF yang belum punya key
// (mis. program lama hasil migrasi), lalu menyimpan key aslinya ke file CSV.
//
// PERHATIAN: key asli hanya ada di file CSV ini. Database hanya menyimpan hash-nya.
// Bagikan ke tiap tim lewat jalur aman, lalu HAPUS file CSV-nya.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { createHash, randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";

// Harus identik dengan lib/program-key.ts
const generate = () => {
  const secret = "lmk_" + randomBytes(32).toString("base64url");
  return {
    secret,
    hash: createHash("sha256").update(secret).digest("hex"),
    prefix: secret.slice(0, 10),
  };
};

const prisma = new PrismaClient();

try {
  const programs = await prisma.program.findMany({
    where: { secret_key_hash: null, deleted_at: null },
    select: { id: true, program_name: true },
    orderBy: { id: "asc" },
  });

  if (programs.length === 0) {
    console.log("Semua program aktif sudah punya secret key. Tidak ada yang dikerjakan.");
  } else {
    const rows = [["program_id", "program_name", "secret_key"]];
    for (const p of programs) {
      const key = generate();
      await prisma.program.update({
        where: { id: p.id },
        data: {
          secret_key_hash: key.hash,
          secret_key_prefix: key.prefix,
          secret_key_generated_at: new Date(),
        },
      });
      rows.push([p.id, `"${p.program_name.replaceAll('"', '""')}"`, key.secret]);
    }

    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const file = `program-keys-${stamp}.csv`;
    writeFileSync(file, rows.map((r) => r.join(",")).join("\n") + "\n", { mode: 0o600 });
    console.log(`✔ ${programs.length} secret key dibuat. Key asli disimpan di: ${file}`);
    console.log("  Bagikan ke masing-masing tim, lalu hapus file tersebut.");
  }
} finally {
  await prisma.$disconnect();
}
