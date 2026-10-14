/**
 * SECURITY — RBAC (Role-Based Access Control)
 * Admin dideteksi via JOIN users → program_groups WHERE group_name = 'Administrator'
 * Tidak ada UUID hardcode. Backward compat: is_admin flag tetap dihormati.
 * MFA: di-skip untuk semua role.
 */

import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import { isAdminUser } from "@/lib/config/admin";

export type Permission =
  | "view:dashboard"
  | "view:logs"
  | "view:all_logs"
  | "view:reporting"
  | "manage:programs"
  | "manage:users"
  | "manage:org"
  | "admin:full"
  | "admin:delete";

/** Fetch user dengan JOIN ke program_group untuk cek nama group */
async function fetchUserWithGroup(nik: string) {
  return db.user.findUnique({
    where: { nik },
    include: { program_group: true },
  });
}

async function fetchUserWithGroupById(id: string) {
  return db.user.findUnique({
    where: { id },
    include: { program_group: true },
  });
}

/** Resolve permissions — admin dapat segalanya */
export async function resolveUserPermissions(nik: string): Promise<Permission[]> {
  const user = await fetchUserWithGroup(nik);
  if (!user) return [];

  if (isAdminUser(user)) {
    return [
      "view:dashboard",
      "view:logs",
      "view:all_logs",
      "view:reporting",
      "manage:programs",
      "manage:users",
      "manage:org",
      "admin:full",
      "admin:delete",
    ];
  }

  const base: Permission[] = ["view:dashboard", "view:logs", "manage:programs"];
  if (user.group_id) base.push("view:reporting");
  return base;
}

export function hasPermission(permissions: Permission[], permission: Permission): boolean {
  return permissions.includes(permission);
}

/** Server-side guard — redirect ke /login atau /unauthorized */
export async function requirePermission(permission: Permission) {
  const session = await getSession();
  if (!session) redirect("/login");

  const permissions = await resolveUserPermissions(session.nik);
  if (!hasPermission(permissions, permission)) redirect("/unauthorized");

  return session;
}

/** Server-side guard — hanya Administrator */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await fetchUserWithGroup(session.nik);
  if (!isAdminUser(user)) redirect("/unauthorized");

  return session;
}

/** API route guard — return 401/403 JSON response */
export async function apiGuard(permission: Permission): Promise<{ session: any } | Response> {
  const session = await getSession();
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { "Content-Type": "application/json" },
    });
  }

  const permissions = await resolveUserPermissions(session.nik);
  if (!hasPermission(permissions, permission)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403, headers: { "Content-Type": "application/json" },
    });
  }

  return { session };
}

/** Validasi akses group — admin bypass semua */
export async function requireTeamAccess(targetGroupId: string) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await fetchUserWithGroup(session.nik);
  if (!user) redirect("/login");

  if (isAdminUser(user)) return session; // admin akses semua group

  if (user.group_id !== targetGroupId) redirect("/unauthorized");

  return session;
}
