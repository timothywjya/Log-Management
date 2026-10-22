// Entitas user. Nama field sengaja sama dengan yang sudah dipakai di seluruh UI
// (role_id, is_guest, dst.) supaya tidak ada perubahan di komponen tampilan.

export interface Role {
  id: number;
  role_name: string;
  position_level: string | null;
  position_description: string;
  group_level: number | null;
  group_description: string;
}

export interface ProgramGroup {
  id: number;
  group_name: string;
}

export interface User {
  id: number;
  nik: string;
  first_name: string | null;
  last_name: string | null;
  user_email: string | null;
  role_id: number | null;
  group_id: number | null;
  is_guest: boolean;
  login_at: Date | null;
  createdAt: Date;
  deleted_at: Date | null;
}

/** User beserta role dan group-nya (dipakai halaman & sidebar). */
export interface UserWithAccess extends User {
  role: Role | null;
  program_group: ProgramGroup | null;
}

/** Profil dianggap lengkap jika nama depan, nama belakang, dan email sudah terisi. */
export const hasCompleteProfile = (u: Pick<User, "first_name" | "last_name" | "user_email">) =>
  !!(u.first_name && u.last_name && u.user_email);
