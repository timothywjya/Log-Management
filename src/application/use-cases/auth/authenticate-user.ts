import { toSessionPayload } from "@/domain/entities/session";
import type { IdentityProvider } from "@/application/ports/identity-provider";
import type { SessionService } from "@/application/ports/session.service";
import type { UserRepository } from "@/application/ports/user.repository";
import { fail, type Result } from "@/application/shared/result";

export type PostLoginDestination = "/dashboard" | "/register" | "/waiting";

export class AuthenticateUser {
  constructor(
    private readonly users: UserRepository,
    private readonly session: SessionService,
    private readonly identity: IdentityProvider,
    /** false = password TIDAK diperiksa ke ESS (hanya untuk development). Lihat ESS_VERIFY_PASSWORD. */
    private readonly verifyPassword: boolean
  ) {}

  async execute(input: { nik: string; password: string }): Promise<Result<{ destination: PostLoginDestination }>> {
    const { nik, password } = input;

    if (!/^\d{10}$/.test(nik) || !password) {
      return fail("NIK (10 digit) dan Password wajib diisi.");
    }

    if (this.verifyPassword) {
      const verified = await this.identity.verify(nik, password);
      if (!verified.ok) return fail(verified.error);
    }

    try {
      const existing = await this.users.findByNik(nik);

      // Akun yang dinonaktifkan admin tidak boleh login lagi.
      if (existing?.deleted_at) {
        return fail("Akun Anda sudah dinonaktifkan. Hubungi administrator.");
      }

      const user = existing ? await this.users.touchLogin(nik) : await this.users.createGuest(nik);

      const payload = toSessionPayload(user);
      await this.session.start(payload);

      const destination: PostLoginDestination = !payload.hasName
        ? "/register"
        : user.is_guest
          ? "/waiting"
          : "/dashboard";
      return { ok: true, destination };
    } catch (err) {
      // Detail error hanya ke log server, tidak dibocorkan ke browser.
      console.error("Auth error:", err);
      return fail("Terjadi kesalahan pada server. Silakan coba lagi.");
    }
  }
}
