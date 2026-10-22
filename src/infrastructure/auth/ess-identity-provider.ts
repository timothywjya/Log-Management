import type { IdentityProvider } from "@/application/ports/identity-provider";
import { env } from "@/infrastructure/config/env";

interface EssResponse {
  LoginESS_V2Result: string;
}

const MAX_ATTEMPTS = 3;

/** Memverifikasi NIK + password ke layanan ESS. */
export class EssIdentityProvider implements IdentityProvider {
  async verify(nik: string, password: string) {
    const response = await this.call(nik, password);
    const result = response?.LoginESS_V2Result;

    if (result === "Sukses") return { ok: true as const };
    return { ok: false as const, error: result || "Gagal terhubung ke server ESS. Silakan coba lagi." };
  }

  private async call(nik: string, password: string): Promise<EssResponse | null> {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const response = await fetch(env.essUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: { nik, pass: password } }),
          cache: "no-store",
          signal: AbortSignal.timeout(8000), // supaya tidak menggantung jika ESS tidak merespons
        });
        if (response.ok) return (await response.json()) as EssResponse;
      } catch {
        // jatuh ke retry
      }
      if (attempt < MAX_ATTEMPTS) await new Promise((r) => setTimeout(r, 1000));
    }

    console.error(`ESS connection failed after ${MAX_ATTEMPTS} attempts`);
    return null;
  }
}
