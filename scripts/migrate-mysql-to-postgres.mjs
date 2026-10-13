// Menyalin data dari database MySQL lama ke PostgreSQL baru.
//
// Persiapan:
//   1. Isi MYSQL_URL (database lama) dan DATABASE_URL (PostgreSQL baru) di .env
//   2. npx prisma migrate deploy        (membuat tabel di PostgreSQL)
//   3. npm run db:migrate-from-mysql
//
// Aman dijalankan: skrip berhenti jika tabel tujuan sudah berisi data.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import mysql from "mysql2/promise";

const { MYSQL_URL, DATABASE_URL } = process.env;
if (!MYSQL_URL || !DATABASE_URL) {
  console.error("MYSQL_URL dan DATABASE_URL harus di-set di .env");
  process.exit(1);
}

const prisma = new PrismaClient();
// timezone "Z": Prisma menyimpan DateTime di MySQL sebagai UTC.
const my = await mysql.createConnection({ uri: MYSQL_URL, timezone: "Z" });

// Urutan penting karena foreign key: induk dulu, anak belakangan.
const tables = [
  {
    sql: "roles", model: "role",
    map: (r) => ({
      id: r.id, position_level: r.position_level, position_description: r.position_description,
      group_level: r.group_level, group_description: r.group_description, role_name: r.role_name,
      created_by: r.created_by, createdAt: r.created_at,
    }),
  },
  {
    sql: "program_groups", model: "programGroup",
    map: (r) => ({
      id: r.id, group_name: r.group_name, created_by: r.created_by,
      createdAt: r.created_at, updatedAt: r.updated_at ?? r.created_at, updated_by: r.updated_by,
    }),
  },
  {
    sql: "program_types", model: "programType",
    map: (r) => ({
      id: r.id, program_type: r.program_type, created_by: r.created_by,
      createdAt: r.created_at, updatedAt: r.updated_at ?? r.created_at, updated_by: r.updated_by,
    }),
  },
  {
    sql: "users", model: "user",
    map: (r) => ({
      id: r.id, role_id: r.role_id, group_id: r.group_id, first_name: r.first_name, last_name: r.last_name,
      nik: r.nik,
      user_email: r.user_email ? String(r.user_email).trim().toLowerCase() : null, // Postgres case-sensitive
      is_guest: Boolean(r.is_guest), login_at: r.login_at,
      createdAt: r.created_at, updatedAt: r.updated_at, updated_by: r.updated_by,
      deleted_at: r.deleted_at, deleted_by: r.deleted_by,
    }),
  },
  {
    sql: "programs", model: "program",
    map: (r) => ({
      id: r.id, program_name: r.program_name, program_type_id: r.program_type_id,
      program_group_id: r.program_group_id, created_by: r.created_by,
      createdAt: r.created_at, updatedAt: r.updated_at ?? r.created_at, updated_by: r.updated_by,
      deleted_at: r.deleted_at, deleted_by: r.deleted_by,
      // secret key sengaja kosong; dibuat lewat `npm run db:backfill-keys` atau tombol di UI.
    }),
  },
];

try {
  for (const t of tables) {
    if ((await prisma[t.model].count()) > 0) {
      throw new Error(`Tabel tujuan "${t.sql}" sudah berisi data. Dibatalkan agar tidak terduplikasi.`);
    }
  }

  const counts = {};
  await prisma.$transaction(
    async (tx) => {
      for (const t of tables) {
        const [rows] = await my.query(`SELECT * FROM \`${t.sql}\` ORDER BY id`);
        const data = rows.map(t.map);
        for (let i = 0; i < data.length; i += 500) {
          await tx[t.model].createMany({ data: data.slice(i, i + 500) });
        }
        counts[t.sql] = { mysql: rows.length };
        console.log(`• ${t.sql}: ${rows.length} baris disalin`);
      }

      // id disalin apa adanya, jadi sequence PostgreSQL harus disinkronkan.
      // Tanpa ini, INSERT berikutnya akan bentrok dengan "duplicate key".
      for (const t of tables) {
        await tx.$executeRawUnsafe(
          `SELECT setval(pg_get_serial_sequence('"${t.sql}"', 'id'), COALESCE((SELECT MAX(id) FROM "${t.sql}"), 1), (SELECT MAX(id) IS NOT NULL FROM "${t.sql}"))`
        );
      }
    },
    { timeout: 120_000 }
  );

  // Verifikasi jumlah baris
  let ok = true;
  for (const t of tables) {
    const pg = await prisma[t.model].count();
    const status = pg === counts[t.sql].mysql ? "OK" : "TIDAK SAMA";
    if (status !== "OK") ok = false;
    console.log(`  ${t.sql.padEnd(15)} mysql=${counts[t.sql].mysql} postgres=${pg} ${status}`);
  }
  console.log(ok ? "\n✔ Migrasi selesai." : "\n✖ Ada jumlah baris yang tidak sama, periksa kembali.");
  console.log("Langkah berikut: npm run db:backfill-keys  (membuat secret key untuk program yang sudah ada)");
  process.exitCode = ok ? 0 : 1;
} catch (err) {
  console.error("✖ Migrasi gagal:", err.message);
  process.exitCode = 1;
} finally {
  await my.end();
  await prisma.$disconnect();
}
