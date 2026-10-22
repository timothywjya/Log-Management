import { z } from "zod";

export const programSchema = z.object({
  name: z.string().trim().min(1, "Nama program wajib diisi").max(255),
  typeId: z.number().int().positive("Tipe program wajib dipilih"),
  groupId: z.number().int().nonnegative().optional(),
});

export type ProgramCommand = { name: string; typeId: number; groupId?: number };
export type ProgramWithKey = { secretKey: string; programName: string };
