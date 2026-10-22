import type {
  AuthenticatedProgram,
  GeneratedProgramKey,
  Program,
  ProgramWithRelations,
} from "@/domain/entities/program";

export interface ProgramInput {
  name: string;
  typeId: number;
  groupId: number;
}

export interface ProgramRepository {
  list(filter: { groupId?: number; query: string }): Promise<ProgramWithRelations[]>;
  /** Hanya status aktif/nonaktif, untuk statistik dashboard. */
  listStatuses(filter: { groupId?: number }): Promise<{ deleted_at: Date | null }[]>;
  /** Id & nama program untuk dropdown filter log. */
  listNames(filter: { groupId?: number }): Promise<{ id: number; program_name: string }[]>;

  findById(id: number): Promise<Pick<Program, "program_group_id" | "deleted_at"> & { program_name: string } | null>;
  findByKeyHash(hash: string): Promise<AuthenticatedProgram | null>;

  create(input: ProgramInput, key: GeneratedProgramKey, createdBy: number): Promise<{ program_name: string }>;
  update(id: number, input: ProgramInput, updatedBy: number): Promise<void>;
  softDelete(id: number, by: number): Promise<void>;
  restore(id: number, by: number): Promise<void>;
  replaceKey(id: number, key: GeneratedProgramKey, by: number): Promise<void>;
}
