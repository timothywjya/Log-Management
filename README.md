# Log Management

Next.js 16 + Prisma + **PostgreSQL**.

## Menjalankan (development)

```bash
npm install
docker compose up -d          # PostgreSQL lokal (atau pakai server Postgres sendiri)
cp .env.example .env          # lalu sesuaikan DATABASE_URL jika perlu
npm run generate:secret       # mengisi APP_SECRET_KEY di .env secara otomatis
npm run db:deploy             # membuat tabel
npm run dev
```

Database baru masih kosong. Aplikasi membutuhkan data awal di tabel `roles`, `program_groups`, dan
`program_types` (id role/group yang dipakai kode: role 1 = admin, group 6 = admin group, dst).
Jika Anda punya data lama di MySQL, salin lewat langkah berikut.

## Migrasi data MySQL → PostgreSQL

1. Isi `MYSQL_URL` (database lama) dan `DATABASE_URL` (PostgreSQL baru) di `.env`.
2. `npm run db:deploy` (membuat tabel di PostgreSQL)
3. `npm run db:migrate-from-mysql`

Skrip menyalin semua tabel dengan id yang sama, menyinkronkan sequence PostgreSQL, lalu mencocokkan jumlah
baris tiap tabel. Skrip berhenti jika tabel tujuan sudah berisi data. Email dinormalisasi ke huruf kecil karena
PostgreSQL membedakan huruf besar/kecil pada unique index.

## Secret key

### Secret key per program
- Dibuat **otomatis** saat program dibuat dan ditampilkan **satu kali** di layar.
- Program lama: klik ikon kunci di kartu program, atau jalankan `npm run db:backfill-keys` untuk
  membuat key semua program aktif sekaligus (hasilnya ke file CSV lokal; hapus setelah dibagikan).
- Format: `lmk_` + 32 byte acak (256 bit). Database hanya menyimpan hash SHA-256 dan prefix 10 karakter,
  jadi key yang hilang tidak bisa dilihat ulang, hanya bisa di-generate ulang (key lama langsung tidak berlaku).
- Memverifikasi key di endpoint penerima log:

```ts
import { findProgramByKey } from "@/lib/program-key";

const program = await findProgramByKey(request.headers.get("x-program-key"));
if (!program) return new Response("Unauthorized", { status: 401 });
```

### Secret key aplikasi (`APP_SECRET_KEY`)
`npm run generate:secret` membuat dan menulisnya ke `.env`. Aplikasi menolak start jika key kosong atau
kurang dari 32 karakter. Mengganti key (`--force`) membuat semua user harus login ulang.

## Catatan deployment
- Jika diakses lewat HTTP (bukan HTTPS), set `COOKIE_SECURE="false"`, kalau tidak browser menolak cookie login
  pada mode production.
- Gunakan `npm run db:deploy` (bukan `db:migrate`) di server production.
