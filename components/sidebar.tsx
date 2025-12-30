"use client";

import { logout } from "@/app/actions/auth";
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Database,
  FileText,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  Users
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar({ user }: { user: any }) {
  const [showLogout, setShowLogout] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();

  // Perbaikan: Pastikan path string sesuai dengan href Link
  const isActive = (path: string) => pathname === path 
    ? "bg-[#1db495] text-white shadow-lg shadow-[#1db495]/20" 
    : "hover:bg-slate-800/50 text-slate-400 hover:text-white";

  // Logika Hak Akses
  const isAdmin = user?.role_id === 1 || user?.group_id === 6;
  
  // Reporting Log hanya untuk Role 4, 5, 8, 9 (Manager & Senior Manager)
  const canSeeReporting = [4, 5, 8, 9].includes(user?.role_id);

  return (
    <aside className="w-64 h-screen bg-[#0f172a] text-white flex flex-col justify-between fixed left-0 top-0 border-r border-slate-800 z-50">
      <div className="p-4 overflow-y-auto">
        
        <div className="flex items-center gap-3 px-3 mb-10 mt-2">
          <div className="w-9 h-9 bg-[#1db495] rounded-xl flex items-center justify-center shadow-lg shadow-[#1db495]/30">
            <Database size={20} className="text-white" />
          </div>
          <h1 className="text-lg font-black tracking-tight uppercase leading-none">
            Log <br/><span className="text-[#1db495]">Management</span>
          </h1>
        </div>
        
        <nav className="space-y-1.5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-3 mb-2">Main Menu</p>
          
          <Link href="/dashboard" className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${isActive('/dashboard')}`}>
            <LayoutDashboard size={18} /> <span className="text-sm font-semibold">Dashboard</span>
          </Link>

          {/* Perbaikan: Link ke /program agar match dengan isActive */}
          <Link href="/program" className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${isActive('/program')}`}>
            <FileText size={18} /> <span className="text-sm font-semibold">Program</span>
          </Link>

          {/* User Management Section */}
          {isAdmin && (
            <div>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${showUserMenu || pathname.startsWith('/users') ? 'text-white bg-slate-800/30' : 'text-slate-400 hover:bg-slate-800/50'}`}
              >
                <div className="flex items-center gap-3">
                  <Users size={18} /> <span className="text-sm font-semibold">User Management</span>
                </div>
                {showUserMenu ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              
              {(showUserMenu || pathname.startsWith('/users')) && (
                <div className="mt-1 ml-4 pl-4 border-l border-slate-700 space-y-1 animate-in slide-in-from-top-2 duration-300">
                  <Link href="/users/team-member" className={`block p-2 text-xs transition-colors ${pathname === '/users/team-member' ? 'text-[#1db495] font-bold' : 'text-slate-400 hover:text-[#1db495]'}`}>
                    Team Member
                  </Link>
                  <Link href="/users/team-programmer" className={`block p-2 text-xs transition-colors ${pathname === '/users/team-programmer' ? 'text-[#1db495] font-bold' : 'text-slate-400 hover:text-[#1db495]'}`}>
                    Team Programmer
                  </Link>
                  <Link href="/users/team-support" className={`block p-2 text-xs transition-colors ${pathname === '/users/team-support' ? 'text-[#1db495] font-bold' : 'text-slate-400 hover:text-[#1db495]'}`}>
                    Team Support
                  </Link>
                </div>
              )}
            </div>
          )}

          <Link href="/log" className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${isActive('/log')}`}>
            <Database size={18} /> <span className="text-sm font-semibold">Activity Log</span>
          </Link>

          {/* Menu Reporting Log Khusus Manager */}
          {canSeeReporting && (
            <Link href="/reporting" className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${isActive('/reporting')}`}>
              <BarChart3 size={18} /> <span className="text-sm font-semibold">Reporting Log</span>
            </Link>
          )}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900/40">
        <div className="relative">
          {showLogout && (
            <div className="absolute bottom-full left-0 w-full mb-3 bg-white text-slate-900 rounded-2xl shadow-2xl p-2 border border-slate-200 animate-in fade-in zoom-in duration-200">
              <button onClick={async () => await logout()} className="w-full flex items-center gap-3 p-3 hover:bg-red-50 text-red-600 rounded-xl transition-colors font-bold text-xs uppercase tracking-wider">
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}

          <div 
            onClick={() => setShowLogout(!showLogout)}
            className="flex items-center gap-3 p-2 rounded-2xl cursor-pointer hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-tr from-[#1db495] to-emerald-400 rounded-xl flex items-center justify-center shadow-lg">
                <UserIcon size={20} className="text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-[3px] border-[#0f172a] rounded-full"></span>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <p className="text-[13px] font-black truncate text-white leading-none mb-1">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-[10px] text-[#1db495] font-bold truncate uppercase tracking-tighter">
                {user?.role?.role_name || "Guest"}
              </p>
            </div>
            <ChevronUp size={14} className={`text-slate-600 transition-transform ${showLogout ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>
    </aside>
  );
}