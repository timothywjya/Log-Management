import type { ProgramType } from "@/domain/entities/program";
import type { ProgramGroup, Role } from "@/domain/entities/user";

/** Data referensi (role, group, tipe program). */
export interface ReferenceRepository {
  listRoles(opts?: { excludeId?: number }): Promise<Role[]>;
  listGroups(): Promise<ProgramGroup[]>;
  listProgramTypes(): Promise<ProgramType[]>;
  roleExists(id: number): Promise<boolean>;
  groupExists(id: number): Promise<boolean>;
  programTypeExists(id: number): Promise<boolean>;
  /** Nama tipe program (mis. "Web"), dipakai untuk menebak kategori log. */
  findProgramTypeName(id: number): Promise<string | null>;
}
