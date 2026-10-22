import type { SessionPayload } from "@/domain/entities/session";
import type { SessionService } from "@/application/ports/session.service";
import { env } from "@/infrastructure/config/env";
import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_TTL_MS, signSessionToken, verifySessionToken } from "./session-token";

/** Menyimpan sesi sebagai JWT di cookie httpOnly. */
export class CookieSessionService implements SessionService {
  async get(): Promise<SessionPayload | null> {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    return token ? verifySessionToken(token) : null;
  }

  async start(payload: SessionPayload): Promise<void> {
    const token = await signSessionToken(payload);
    (await cookies()).set(SESSION_COOKIE, token, {
      expires: new Date(Date.now() + SESSION_TTL_MS),
      httpOnly: true,
      secure: env.cookieSecure,
      sameSite: "lax",
      path: "/",
    });
  }

  async end(): Promise<void> {
    (await cookies()).delete(SESSION_COOKIE);
  }
}
