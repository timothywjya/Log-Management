/**
 * KONFIGURASI ADMINISTRATOR & MANAGER
 * ─────────────────────────────────────────────────────────────
 * Admin    : group_name = 'Administrator' ATAU is_admin = true
 * Manager  : is_manager = true (diset manual via admin panel)
 *   - Manager Programmer: team_type = 'programmer' → kelola Teams + Group
 *   - Manager Support   : team_type = 'support'    → kelola Teams + Group
 *   - Administrator     : semua akses
 */

export function isAdminUser(user: {
  is_admin?: boolean | null;
  group_id?: string | null;
  program_group?: { group_name?: string | null } | null;
} | null | undefined): boolean {
  if (!user) return false;
  if (user.is_admin === true) return true;
  return user.program_group?.group_name?.toLowerCase() === "administrator";
}

export function isManagerUser(user: {
  is_manager?: boolean | null;
} | null | undefined): boolean {
  if (!user) return false;
  return user.is_manager === true;
}

/** Resolve role string dari user object */
export function resolveRole(user: any): "administrator" | "manager_programmer" | "manager_support" | "staff" {
  if (isAdminUser(user)) return "administrator";
  if (user?.is_manager) {
    const teamType = (user?.team?.team_type ?? "").toLowerCase();
    if (teamType === "support") return "manager_support";
    return "manager_programmer"; // default manager = programmer
  }
  // Fallback: deteksi dari nama team (backward compat)
  const teamName = (user?.team?.team_name ?? "").toLowerCase();
  if (teamName.includes("programmer")) return "manager_programmer";
  if (teamName.includes("support")) return "manager_support";
  return "staff";
}
