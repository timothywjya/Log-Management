import { toSessionPayload } from "@/domain/entities/session";
import type { SessionService } from "@/application/ports/session.service";
import type { UserRepository } from "@/application/ports/user.repository";
import { DuplicateEmailError } from "@/application/shared/errors";
import { z } from "zod";

const schema = z.object({
  firstName: z.string().trim().min(1, "Nama depan wajib diisi").max(100),
  lastName: z.string().trim().min(1, "Nama belakang wajib diisi").max(100),
  email: z.string().trim().toLowerCase().email("Format email tidak valid").max(150),
});

export type CompleteProfileOutcome =
  | { status: "no-session" }
  | { status: "user-missing" }
  | { status: "invalid"; error: string }
  | { status: "failed"; error: string }
  | { status: "saved"; isGuest: boolean };

/** Melengkapi profil user yang baru login pertama kali (halaman /register). */
export class CompleteProfile {
  constructor(
    private readonly users: UserRepository,
    private readonly session: SessionService
  ) {}

  async execute(input: { firstName: unknown; lastName: unknown; email: unknown }): Promise<CompleteProfileOutcome> {
    // NIK diambil dari sesi, BUKAN dari form, supaya user tidak bisa menimpa profil orang lain.
    const current = await this.session.get();
    if (!current?.nik) return { status: "no-session" };

    const parsed = schema.safeParse(input);
    if (!parsed.success) return { status: "invalid", error: parsed.error.issues[0].message };

    const existing = await this.users.findActiveByNik(current.nik);
    if (!existing) return { status: "user-missing" };

    try {
      // is_guest sengaja tidak diubah di sini; hanya admin yang boleh lewat ApproveUser.
      const user = await this.users.updateProfile(current.nik, {
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        user_email: parsed.data.email,
      });
      await this.session.start(toSessionPayload(user));
      return { status: "saved", isGuest: user.is_guest };
    } catch (err) {
      if (err instanceof DuplicateEmailError) return { status: "failed", error: err.message };
      console.error("Register error:", err);
      return { status: "failed", error: "Gagal menyimpan profil. Silakan coba lagi." };
    }
  }
}

