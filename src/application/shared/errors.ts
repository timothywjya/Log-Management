/** Dilempar repository saat email sudah dipakai akun lain (unique constraint). */
export class DuplicateEmailError extends Error {
  constructor() {
    super("Email sudah digunakan akun lain.");
    this.name = "DuplicateEmailError";
  }
}
