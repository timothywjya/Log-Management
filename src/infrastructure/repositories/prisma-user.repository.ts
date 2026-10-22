import type { User, UserWithAccess } from "@/domain/entities/user";
import type { ProfileData, UserRepository } from "@/application/ports/user.repository";
import { DuplicateEmailError } from "@/application/shared/errors";
import { prisma as db } from "@/infrastructure/prisma/client";

const withAccess = { role: true, program_group: true } as const;

const isUniqueViolation = (err: unknown) =>
  typeof err === "object" && err !== null && (err as { code?: string }).code === "P2002";

export class PrismaUserRepository implements UserRepository {
  findByNik(nik: string): Promise<User | null> {
    return db.user.findUnique({ where: { nik } });
  }

  findActiveByNik(nik: string): Promise<UserWithAccess | null> {
    return db.user.findFirst({ where: { nik, deleted_at: null }, include: withAccess });
  }

  findById(id: number): Promise<UserWithAccess | null> {
    return db.user.findUnique({ where: { id }, include: withAccess });
  }

  createGuest(nik: string): Promise<User> {
    return db.user.create({ data: { nik, is_guest: true, login_at: new Date() } });
  }

  touchLogin(nik: string): Promise<User> {
    return db.user.update({ where: { nik }, data: { login_at: new Date() } });
  }

  async updateProfile(nik: string, data: ProfileData): Promise<User> {
    try {
      return await db.user.update({ where: { nik }, data });
    } catch (err) {
      if (isUniqueViolation(err)) throw new DuplicateEmailError();
      throw err;
    }
  }

  async isEmailTaken(email: string, exceptNik: string): Promise<boolean> {
    const found = await db.user.findFirst({
      where: { user_email: email, NOT: { nik: exceptNik } },
      select: { id: true },
    });
    return found !== null;
  }

  countActive(filter: { groupId?: number | null }): Promise<number> {
    return db.user.count({
      where: {
        is_guest: false,
        deleted_at: null,
        ...(filter.groupId !== undefined ? { group_id: filter.groupId } : {}),
      },
    });
  }

  countPendingGuests(): Promise<number> {
    return db.user.count({ where: { is_guest: true, deleted_at: null } });
  }

  listPendingGuests(): Promise<User[]> {
    return db.user.findMany({ where: { is_guest: true, deleted_at: null }, orderBy: { createdAt: "desc" } });
  }

  listMembersByGroupLevel(groupLevel: number): Promise<UserWithAccess[]> {
    return db.user.findMany({
      where: { is_guest: false, role: { group_level: groupLevel } },
      include: withAccess,
      orderBy: { first_name: "asc" },
    });
  }

  async approveGuest(userId: number, roleId: number, groupId: number, approvedBy: number): Promise<void> {
    await db.user.update({
      where: { id: userId },
      data: { role_id: roleId, group_id: groupId, is_guest: false, updated_by: approvedBy },
    });
  }

  async deleteGuest(userId: number): Promise<boolean> {
    const result = await db.user.deleteMany({ where: { id: userId, is_guest: true } });
    return result.count > 0;
  }

  async setDeleted(userId: number, deleted: boolean, actorId: number): Promise<void> {
    await db.user.update({
      where: { id: userId },
      data: deleted ? { deleted_at: new Date(), deleted_by: actorId } : { deleted_at: null, deleted_by: null },
    });
  }
}
