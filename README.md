# Log Management

Next.js 16 + Prisma 7 + PostgreSQL, disusun dengan Clean Architecture (lihat [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)).

## Struktur

```
src/
  domain/          entitas & aturan murni
  application/     use case + port (interface)
  infrastructure/  Prisma, sesi JWT, ESS, container (composition root)
  presentation/    server action, guard, komponen React
  app/             route Next.js (tipis)
prisma/            schema & migrasi
scripts/           generate-secret, backfill-program-keys, send-test-logs
docs/              ARCHITECTURE.md, ACTIVITY_LOG.md
```

## Menjalankan (development)

```bash
npm install
docker compose up -d          # PostgreSQL lokal (atau pakai server Postgres sendiri)
cp .env.example .env          # lalu sesuaikan
npm run generate:secret       # mengisi APP_SECRET_KEY di .env otomatis
npm run db:deploy             # membuat tabel
npm run dev
```

Database baru masih kosong. Aplikasi membutuhkan data awal di tabel `roles`, `program_groups`, dan
`program_types` (role 1 = admin, group 6 = admin group, dst; lihat `src/domain/policies/permissions.ts`).

## Konfigurasi penting

- `ESS_VERIFY_PASSWORD="true"` **wajib di production**. Jika `false`, password tidak diperiksa dan siapa pun
  dengan NIK 10 digit bisa login.
- `COOKIE_SECURE="false"` jika diakses lewat HTTP (bukan HTTPS).
- `APP_SECRET_KEY` minimal 32 karakter. Mengganti key membuat semua user harus login ulang.
- Gunakan `npm run db:deploy` (bukan `db:migrate`) di server production.

## Secret key program

- Dibuat **otomatis** saat program dibuat dan ditampilkan **satu kali**.
- Program lama: klik ikon kunci di kartu program, atau `npm run db:backfill-keys` (hasil ke file CSV lokal; hapus setelah dibagikan).
- Format `lmk_` + 32 byte acak. Database hanya menyimpan hash SHA-256 dan prefix, jadi key hilang hanya bisa di-generate ulang.
- Mengirim log: lihat [docs/ACTIVITY_LOG.md](docs/ACTIVITY_LOG.md). Uji cepat: `PROGRAM_KEY=lmk_xxx npm run logs:send-test`.

## Perintah

`npm run dev | build | lint | typecheck`
