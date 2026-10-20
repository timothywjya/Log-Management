// Mengirim contoh log ke SEMUA 4 kategori, untuk mengecek halaman /log/*.
//
// Pakai (PowerShell):
//   $env:PROGRAM_KEY="lmk_xxx"; node scripts/send-test-logs.mjs
//   $env:PROGRAM_KEY="lmk_xxx"; node scripts/send-test-logs.mjs http://localhost:3000
//
// Key dibaca dari environment (bukan argumen) supaya tidak tersimpan di riwayat perintah.

const key = process.env.PROGRAM_KEY;
const base = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");

if (!key) {
  console.error("Set dulu PROGRAM_KEY (secret key program dari halaman Program).");
  process.exit(1);
}

const ago = (min) => new Date(Date.now() - min * 60_000).toISOString();

const logs = [
  // ---- web
  { category: "web", level: "info", action: "login", actor: "1234567890", message: "Login berhasil",
    ip_address: "10.1.2.3", occurred_at: ago(1), metadata: { method: "POST", path: "/login", status: 200, duration_ms: 142 } },
  { category: "web", level: "warn", action: "slow_request", actor: "1234567890", message: "Response lambat",
    occurred_at: ago(5), metadata: { method: "GET", path: "/laporan/penjualan", status: 200, duration_ms: 5120 } },
  { category: "web", level: "error", action: "unhandled_error", message: "NullReference di ReportController",
    occurred_at: ago(9), metadata: { method: "GET", path: "/laporan/stok", status: 500 } },
  // ---- job
  { category: "job", level: "info", action: "job_finished", message: "Sinkron data toko selesai",
    occurred_at: ago(2), metadata: { job_name: "sync-toko", status: "success", duration_ms: 18342 } },
  { category: "job", level: "error", action: "job_failed", message: "Timeout koneksi ke database sumber",
    occurred_at: ago(30), metadata: { job_name: "rekap-harian", status: "failed", duration_ms: 60000 } },
  // ---- desktop
  { category: "desktop", level: "info", action: "app_start", actor: "1234567890", device: "PC-KASIR-01", app_version: "2.4.1",
    occurred_at: ago(3), metadata: { os: "Windows 10 22H2" } },
  { category: "desktop", level: "warn", action: "printer_offline", device: "PC-KASIR-01", app_version: "2.4.1",
    message: "Printer struk tidak merespons", occurred_at: ago(12), metadata: { os: "Windows 10 22H2" } },
  // ---- mobile
  { category: "mobile", level: "info", action: "screen_view", actor: "1234567890", device: "Samsung A54", app_version: "1.8.0",
    occurred_at: ago(4), metadata: { os: "Android 14", screen: "Dashboard" } },
  { category: "mobile", level: "error", action: "crash", device: "iPhone 13", app_version: "1.8.0",
    message: "Aplikasi berhenti tiba-tiba", occurred_at: ago(20), metadata: { os: "iOS 17.5" } },
];

const res = await fetch(`${base}/api/log`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-program-key": key },
  body: JSON.stringify(logs),
});

console.log(res.status, await res.text());
process.exit(res.ok ? 0 : 1);
