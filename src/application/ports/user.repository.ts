import type { User, UserWithAccess } from "@/domain/entities/user";

export interface ProfileData {
  first_name: string;
  last_name: string;
  user_email: string;
}

export interface UserRepository {
  /** Termasuk user yang sudah dinonaktifkan. */
  findByNik(nik: string): Promise<User | null>;
  findActiveByNik(nik: string): Promise<UserWithAccess | null>;
  findById(id: number): Promise<UserWithAccess | null>;

  createGuest(nik: string): Promise<User>;
  touchLogin(nik: string): Promise<User>;

  /** Melempar DuplicateEmailError jika email sudah dipakai akun lain. */
  updateProfile(nik: string, data: ProfileData): Promise<User>;
  isEmailTaken(email: string, exceptNik: string): Promise<boolean>;

  /** groupId: undefined = semua group; null = hanya user tanpa group. */
  countActive(filter: { groupId?: number | null }): Promise<number>;
  countPendingGuests(): Promise<number>;
  listPendingGuests(): Promise<User[]>;
  /** Anggota aktif (bukan guest) berdasarkan group_level role-nya. */
  listMembersByGroupLevel(groupLevel: number): Promise<UserWithAccess[]>;

  approveGuest(userId: number, roleId: number, groupId: number, approvedBy: number): Promise<void>;
  /** Menghapus akun guest. Mengembalikan false jika tidak ada guest dengan id tsb. */
  deleteGuest(userId: number): Promise<boolean>;
  setDeleted(userId: number, deleted: boolean, actorId: number): Promise<void>;
}
