# Arsitektur

Project ini memakai **Clean Architecture**. Aturan utamanya: dependensi hanya menunjuk ke dalam.

```
presentation / app  ──►  application  ──►  domain
        │                     ▲
        └──►  infrastructure ─┘   (mengimplementasikan port milik application)
```

| Lapisan | Folder | Isi | Boleh bergantung pada |
|---|---|---|---|
| Domain | `src/domain` | Entitas, aturan akses (`policies/permissions.ts`), kategori log, format secret key. Kode murni TypeScript. | tidak ada |
| Application | `src/application` | **Use case** (satu class per aksi bisnis) dan **port** (interface repository/service). | domain (+ `zod` untuk validasi) |
| Infrastructure | `src/infrastructure` | Adapter: Prisma, JWT cookie, ESS, rate limiter, crypto. `container.ts` merakit semuanya. | application, domain |
| Presentation | `src/app`, `src/presentation`, `src/proxy.ts` | Halaman Next.js, route handler, server action, guard, komponen React. Tipis: hanya menerjemahkan request ke use case dan hasilnya ke tampilan. | semua lapisan (use case diambil lewat `container`) |

## Alur contoh: membuat program

`ProgramModal` (client) → server action `presentation/actions/program.ts` → guard `getActionUser()`
→ `container.createProgram.execute(user, input)` → use case memvalidasi, menerapkan aturan akses,
lalu memanggil port `ProgramRepository` / `ProgramKeyService` → diimplementasikan oleh
`PrismaProgramRepository` / `NodeProgramKeyService`.

## Menambah fitur

1. Butuh data baru? Tambah method di port (`application/ports`) dan implementasinya di `infrastructure/repositories`.
2. Tulis use case di `application/use-cases/<area>/`, daftarkan di `infrastructure/container.ts`.
3. Panggil dari page / server action / route handler lewat `container`.

Mengganti teknologi (mis. rate limiter di memori → Redis) cukup membuat adapter baru dan mengganti satu baris di `container.ts`.

## Catatan

- Nama field entitas (`role_id`, `is_guest`, ...) sengaja sama dengan nama kolom database agar komponen UI tidak berubah.
- Otorisasi untuk **aksi tulis** ada di use case (bukan hanya di UI). Halaman baca admin dijaga oleh `requireUser({ admin: true })`.
- `proxy.ts` mengimpor `infrastructure/auth/session-token` langsung (bukan lewat container) agar tidak memuat Prisma di setiap request.
