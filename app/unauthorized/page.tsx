import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="text-center">
        <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🔒</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Akses Ditolak</h1>
        <p className="text-slate-500 mb-6">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        <Link href="/dashboard" className="bg-[#1db495] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#17a080] transition-all">
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
