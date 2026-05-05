"use client";

import { isAdminUser, isManagerUser, resolveRole } from "@/lib/config/admin";
import { logout } from "@/app/actions/auth";
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  Database,
  FileText,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  Shield,
  User as UserIcon,
  UserCog,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

// ─── Nav Link ─────────────────────────────────────────────────
function NavLink({ href, icon, label, active, onClick }: {
  href: string; icon: React.ReactNode; label: string; active: boolean; onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold
        ${active ? "bg-[#1db495] text-white shadow shadow-[#1db495]/30" : "text-slate-400 hover:bg-slate-800/60 hover:text-white"}`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

// ─── Sidebar content (shared desktop + mobile) ────────────────
function SidebarContent({ user, onClose }: { user: any; onClose?: () => void }) {
  const [showLogout, setShowLogout] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const role = resolveRole(user);
  const isAdmin = role === "administrator";
  const isMgrProgrammer = role === "manager_programmer";
  const isMgrSupport = role === "manager_support";
  const isManager = isMgrProgrammer || isMgrSupport;
  const canSeeReporting = isAdmin || isMgrProgrammer || isMgrSupport || user?.group_id != null;
  const canSeeUsers = isAdmin || isManager;

  const roleBadge = {
    administrator:     { label: "Administrator", cls: "text-red-400" },
    manager_programmer:{ label: "Mgr. Programmer", cls: "text-violet-400" },
    manager_support:   { label: "Mgr. Support", cls: "text-sky-400" },
    staff:             { label: user?.program_group?.group_name ?? "Staff", cls: "text-[#1db495]" },
  }[role];

  const handleSignOut = async () => {
    const r = await Swal.fire({
      title: "Keluar dari aplikasi?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
      customClass: { popup: "rounded-3xl", confirmButton: "rounded-xl", cancelButton: "rounded-xl" },
    });
    if (r.isConfirmed) await logout();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#1db495] rounded-xl flex items-center justify-center shadow shadow-[#1db495]/30 shrink-0">
            <Database size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-[14px] font-black tracking-tight text-white">Log Management</h1>
            <p className="text-[9px] text-[#1db495] font-bold uppercase tracking-widest">System</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 mt-1">Menu</p>
        <NavLink href="/dashboard"  icon={<LayoutDashboard size={16} />} label="Dashboard"  active={pathname === "/dashboard"}  onClick={onClose} />
        <NavLink href="/program"    icon={<FileText size={16} />}        label="Program"    active={pathname === "/program"}    onClick={onClose} />
        {canSeeReporting && (
          <NavLink href="/reporting" icon={<BarChart3 size={16} />} label="Reporting" active={pathname === "/reporting"} onClick={onClose} />
        )}

        {/* Users section */}
        {canSeeUsers && (
          <>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 mt-4">Tim</p>
            <NavLink
              href="/teams"
              icon={<Layers size={16} />}
              label="Manajemen Tim"
              active={pathname.startsWith("/teams")}
              onClick={onClose}
            />
            {(isAdmin || isMgrProgrammer) && (
              <NavLink
                href="/users/team-programmer"
                icon={<Users size={16} />}
                label="Tim Programmer"
                active={pathname === "/users/team-programmer"}
                onClick={onClose}
              />
            )}
            {(isAdmin || isMgrSupport) && (
              <NavLink
                href="/users/team-support"
                icon={<Users size={16} />}
                label="Tim Support"
                active={pathname === "/users/team-support"}
                onClick={onClose}
              />
            )}
            <NavLink
              href="/users/request-member"
              icon={<UserCog size={16} />}
              label="Request Member"
              active={pathname === "/users/request-member"}
              onClick={onClose}
            />
          </>
        )}

        {/* Admin panel */}
        {isAdmin && (
          <>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 mt-4">Admin</p>
            <NavLink
              href="/admin"
              icon={<Shield size={16} />}
              label="Admin Panel"
              active={pathname === "/admin"}
              onClick={onClose}
            />
          </>
        )}
      </nav>

      {/* User info + logout */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={() => setShowUserMenu((p) => !p)}
          className="w-full flex items-center gap-3 p-3 bg-slate-800/60 rounded-xl hover:bg-slate-800 transition-all"
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-black
            ${isAdmin ? "bg-red-500/20 text-red-400" : "bg-[#1db495]/20 text-[#1db495]"}`}>
            {user?.first_name?.[0]?.toUpperCase() ?? <UserIcon size={14} />}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-bold text-white truncate">{user?.first_name} {user?.last_name}</p>
            <p className={`text-[9px] font-bold uppercase ${roleBadge.cls}`}>{roleBadge.label}</p>
          </div>
          <ChevronDown size={13} className={`text-slate-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
        </button>
        {showUserMenu && (
          <div className="mt-1 space-y-0.5">
            <Link href="/profile" onClick={onClose}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800/60 hover:text-white transition-all">
              <UserIcon size={13} /> Profil Saya
            </Link>
            <button onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut size={13} /> Keluar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Sidebar export ──────────────────────────────────────
export default function Sidebar({ user }: { user: any }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-[#0f172a] text-white fixed left-0 top-0 h-screen z-50 border-r border-slate-800">
        <SidebarContent user={user} />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0f172a] border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#1db495] rounded-xl flex items-center justify-center shrink-0">
            <Database size={16} className="text-white" />
          </div>
          <span className="text-sm font-black text-white">Log Management</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-2 text-slate-400 hover:text-white transition-colors">
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 bg-[#0f172a] h-full flex flex-col border-r border-slate-800 overflow-y-auto">
            <div className="absolute top-3 right-3">
              <button onClick={() => setMobileOpen(false)} className="p-2 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <SidebarContent user={user} onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
