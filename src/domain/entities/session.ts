import { hasCompleteProfile, type User } from "./user";

export type SessionPayload = {
  nik: string;
  role_id: number | null;
  group_id: number | null;
  is_guest: boolean;
  /** true jika profil (nama depan, nama belakang, email) sudah lengkap */
  hasName: boolean;
};

/** Isi sesi diturunkan dari data user di database setiap kali sesi dibuat/diperbarui. */
export function toSessionPayload(user: Pick<User, "nik" | "role_id" | "group_id" | "is_guest" | "first_name" | "last_name" | "user_email">): SessionPayload {
  return {
    nik: user.nik,
    role_id: user.role_id,
    group_id: user.group_id,
    is_guest: user.is_guest,
    hasName: hasCompleteProfile(user),
  };
}
