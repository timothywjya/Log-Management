/** Penyedia identitas eksternal (ESS) untuk memverifikasi NIK + password. */
export interface IdentityProvider {
  verify(nik: string, password: string): Promise<{ ok: true } | { ok: false; error: string }>;
}
