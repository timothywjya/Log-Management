import { logout, updateSessionStatus } from "@/app/actions/auth";
import db from "@/lib/db";
import { getSession } from "@/lib/session";
import { Clock, LogOut, RefreshCw, ShieldAlert } from "lucide-react";
import { redirect } from "next/navigation";

export default async function WaitingPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { nik: session!.nik },
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-xl border border-slate-100 p-10 text-center">
        <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-amber-100">
          <Clock className="text-amber-500 animate-pulse" size={40} />
        </div>

        <h1 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
          Account <span className="text-[#1db495]">Verification</span>
        </h1>
        
        <p className="text-slate-500 font-medium italic text-sm mb-8 leading-relaxed">
          Hello, <span className="text-slate-900 font-bold">{user?.first_name}</span>. 
          Your account is currently under review.
        </p>

        {user && !user.is_guest && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl">
             <p className="text-xs text-green-600 font-bold mb-3">
               Good news! Your account has been approved.
             </p>
             <form action={updateSessionStatus}>
                <button className="w-full flex items-center justify-center gap-2 bg-[#1db495] text-white p-3 rounded-xl font-bold text-xs hover:bg-[#168a73] transition-all">
                  <RefreshCw size={14} /> Update Session & Enter Dashboard
                </button>
             </form>
          </div>
        )}

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-8 flex items-start gap-3 text-left">
          <ShieldAlert className="text-slate-400 mt-0.5" size={18} />
          <p className="text-[11px] text-slate-500 font-semibold leading-normal uppercase tracking-wider">
            Access restricted. You cannot access the dashboard while "Guest" status is active.
          </p>
        </div>

        <form action={logout}>
          <button className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white p-4 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
            <LogOut size={18} /> Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}