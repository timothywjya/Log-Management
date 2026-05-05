import prisma from "@/lib/db";
import { User } from "@prisma/client";
import { BaseRepository } from "./base.repository";

type UserWithRelations = User & {
  team?: any;
  sub_team?: any;
  program_group?: any;
};

type UserCreateInput = {
  nik: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  user_email?: string;
  password_hash?: string;
  team_id?: string;
  sub_team_id?: string;
  group_id?: string;
  is_guest?: boolean;
};

type UserUpdateInput = Partial<UserCreateInput> & {
  mfa_secret?: string;
  mfa_enabled?: boolean;
  login_at?: Date;
  updated_by?: string;
};

export class UserRepository extends BaseRepository<User, UserCreateInput, UserUpdateInput> {
  protected modelName = "user" as const;

  /** Override: User id is a String (UUID) */
  async findById(id: string, include?: object): Promise<User | null> {
    return prisma.user.findUnique({ where: { id }, include }) as Promise<User | null>;
  }

  async findByNik(nik: string, includeRelations = false): Promise<UserWithRelations | null> {
    return prisma.user.findUnique({
      where: { nik },
      include: includeRelations
        ? { team: true, sub_team: true, program_group: true }
        : undefined,
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { username } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { user_email: email } });
  }

  async findActiveUsers(teamId?: string): Promise<UserWithRelations[]> {
    return prisma.user.findMany({
      where: {
        deleted_at: null,
        is_guest: false,
        ...(teamId ? { team_id: teamId } : {}),
      },
      include: { team: true, sub_team: true },
      orderBy: { created_at: "desc" },
    });
  }

  async findGuestUsers(): Promise<User[]> {
    return prisma.user.findMany({ where: { is_guest: true, deleted_at: null } });
  }

  async approveUser(
    id: string,
    teamId: string,
    subTeamId: string,
    groupId: string,
    approvedBy: string
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        is_guest: false,
        team_id: teamId,
        sub_team_id: subTeamId,
        group_id: groupId,
        updated_by: approvedBy,
      },
    });
  }

  async updateMfaSecret(id: string, encryptedSecret: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { mfa_secret: encryptedSecret, mfa_enabled: true },
    });
  }

  async disableMfa(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { mfa_secret: null, mfa_enabled: false },
    });
  }

  async updateLoginTimestamp(nik: string): Promise<void> {
    await prisma.user.update({ where: { nik }, data: { login_at: new Date() } });
  }

  async upsertByNik(nik: string, data: Partial<UserCreateInput>): Promise<User> {
    return prisma.user.upsert({
      where: { nik },
      create: { nik, ...data },
      update: { login_at: new Date(), ...data },
    });
  }

  /** Override update to accept String id */
  async update(id: string, data: UserUpdateInput): Promise<User> {
    return prisma.user.update({ where: { id }, data }) as Promise<User>;
  }
}

export const userRepository = new UserRepository();
