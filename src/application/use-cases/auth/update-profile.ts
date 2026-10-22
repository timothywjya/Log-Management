import type { UserRepository } from "@/application/ports/user.repository";
import { DuplicateEmailError } from "@/application/shared/errors";
import { fail, type Result } from "@/application/shared/result";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REQUIRED = "Nama dan email wajib diisi";

export class UpdateProfile {
  constructor(private readonly users: UserRepository) {}

  async execute(nik: string, input: { firstName: string; lastName: string; email: string }): Promise<Result> {
    const firstName = input.firstName.trim();
    const lastName = input.lastName.trim();
    const email = input.email.trim().toLowerCase();

    if (!firstName || !lastName || !email) return fail(REQUIRED);
    if (firstName.length > 100 || lastName.length > 100 || email.length > 150) {
      return fail("Nama atau email terlalu panjang");
    }
    if (!EMAIL_RE.test(email)) return fail("Format email tidak valid");

    const user = await this.users.findByNik(nik);
    if (!user) return fail("User tidak ditemukan");

    if (email !== user.user_email && (await this.users.isEmailTaken(email, nik))) {
      return fail("Email sudah digunakan akun lain");
    }

    try {
      await this.users.updateProfile(nik, { first_name: firstName, last_name: lastName, user_email: email });
    } catch (err) {
      if (err instanceof DuplicateEmailError) return fail("Email sudah digunakan akun lain");
      throw err;
    }
    return { ok: true };
  }
}
