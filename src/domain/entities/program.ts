import type { ProgramGroup } from "./user";

export interface ProgramType {
  id: number;
  program_type: string;
}

export interface Program {
  id: number;
  program_name: string;
  program_type_id: number;
  program_group_id: number;
  deleted_at: Date | null;
  secret_key_prefix: string | null;
  secret_key_generated_at: Date | null;
}

/** Program lengkap dengan tipe dan group, untuk halaman daftar program. */
export interface ProgramWithRelations extends Program {
  program_type: ProgramType;
  program_group: ProgramGroup;
}

/** Program yang teridentifikasi lewat secret key (dipakai endpoint penerima log). */
export interface AuthenticatedProgram {
  id: number;
  program_name: string;
  program_group_id: number;
  program_type_id: number;
}

/** Secret key hanya ditampilkan sekali; yang disimpan hanya hash dan prefix. */
export interface GeneratedProgramKey {
  secret: string;
  hash: string;
  prefix: string;
}
