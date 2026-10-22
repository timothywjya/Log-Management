// Format secret key program: "lmk_" + 32 byte acak (base64url, 43 karakter).
export const PROGRAM_KEY_PREFIX = "lmk_";
export const PROGRAM_KEY_PATTERN = /^lmk_[A-Za-z0-9_-]{43}$/;

export const isProgramKeyFormat = (value: string | null | undefined): value is string =>
  !!value && PROGRAM_KEY_PATTERN.test(value);
