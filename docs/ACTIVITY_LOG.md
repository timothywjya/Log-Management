# Activity Log

Log dipisah menjadi 4 kategori. Tiap kategori punya halaman sendiri dan tabel sendiri di database:

| Kategori | Halaman        | Tabel         |
|----------|----------------|---------------|
| Web      | `/log/web`     | `log_web`     |
| Job      | `/log/job`     | `log_job`     |
| Desktop  | `/log/desktop` | `log_desktop` |
| Mobile   | `/log/mobile`  | `log_mobile`  |

`/log` otomatis mengarah ke `/log/web`. Akses mengikuti halaman Program: admin dan role 4/5 melihat semua
program; role lain hanya log dari program milik group-nya.
Program dikenali dari kolom `*_program_id` (berisi `programs.id` dalam bentuk teks).

## Mengirim log: `POST /api/log`

Header wajib: `x-program-key: lmk_...` (secret key program, dari halaman Program) dan
`Content-Type: application/json`. Boleh mengirim satu objek, atau array (maks 100 per request).

| Field         | Wajib | Keterangan |
|---------------|-------|------------|
| `category`    | tidak | `web` \| `job` \| `desktop` \| `mobile`. Jika kosong, diturunkan dari nama tipe program (lihat `src/domain/log/log-category.ts`). |
| `level`       | tidak | `trace` \| `debug` \| `info` (default) \| `warn` \| `error` \| `fatal` (disimpan sebagai enum huruf besar) |
| `action`      | ya    | Nama kejadian, maks 100 karakter. Disimpan di kolom `*_method_name` kecuali `method_name` diisi. |
| `message`     | tidak | Teks bebas, maks 4000 karakter |
| `actor`       | tidak | NIK / username pelaku (`*_user_id`) |
| `ip_address`  | tidak | IP pengguna akhir |
| `device`      | tidak | Nama mesin (`*_machine_name`); di mobile juga mengisi `device_id` jika `device_id` kosong |
| `app_version` | tidak | Versi aplikasi |
| `occurred_at` | tidak | ISO 8601 dengan zona waktu, mis. `2026-10-15T09:30:00+07:00`. Default: waktu server menerima. |
| `metadata`    | tidak | Objek datar (nilai string/angka/boolean/null), maks 8000 karakter. Disimpan di `*_method_arguments`. `duration_ms` dan `os` di dalamnya otomatis mengisi `execution_time_ms` dan `os_version`. |

Field opsional yang langsung sesuai kolom tabel: `application` (default: nama program), `module`, `form_name`,
`method_name`, `correlation_id` (UUID), `transaction_no`, `station_id`, `device_id`, `device_type`, `device_merk`
(tiga terakhir khusus mobile), `branch_code`, `store_code`, `os_version`, `thread_id`, `execution_time_ms`,
`exception_message`, `stack_trace`.

Log yang bentrok dengan unique key dedup (cabang + toko + station/device + `correlation_id`) dilewati, sehingga
mengirim ulang log yang sama tidak membuat data ganda; `received` hanya menghitung baris yang benar-benar baru.

Respons: `201 {"ok":true,"received":N}`. Kesalahan: `401` key salah/program nonaktif, `413` body terlalu besar,
`422` data tidak valid, `429` melebihi 1000 log per menit per program (lihat header `Retry-After`).

### Contoh

```bash
curl -X POST http://localhost:3000/api/log \
  -H "Content-Type: application/json" \
  -H "x-program-key: lmk_xxx" \
  -d '{"category":"job","level":"error","action":"job_failed","message":"Timeout",
       "metadata":{"job_name":"rekap-harian","status":"failed","duration_ms":60000}}'
```

## Keamanan
- Kirim log dari **server** aplikasi Anda. Jangan menaruh secret key di JavaScript yang berjalan di browser.
- Aplikasi desktop/mobile yang menyimpan key di dalam aplikasi: anggap key itu bisa diekstrak. Jika bocor,
  klik ikon kunci di halaman Program untuk membuat key baru (key lama langsung tidak berlaku).
- Jangan mengirim password, token, atau data pribadi sensitif ke `message` maupun `metadata`.
