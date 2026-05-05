import Sidebar from "@/components/sidebar";
import { requirePermission } from "@/lib/security/rbac";
import { redirect } from "next/navigation";
import { userRepository } from "@/lib/repositories/user.repository";
import ReportingClient from "./ReportingClient";

export default async function ReportingPage() {
  const session = await requirePermission("view:reporting");
  const user = await userRepository.findByNik(session.nik, true);
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar user={user} />
      <main className="lg:ml-60 flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 min-w-0">
        <header className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Reporting Log</h1>
          <p className="text-slate-500 text-sm font-medium mt-0.5 italic">Analisis dan unduh laporan aktivitas log</p>
        </header>
        <ReportingClient />
      </main>
    </div>
  );
}
