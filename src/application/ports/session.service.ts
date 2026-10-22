import type { SessionPayload } from "@/domain/entities/session";

export interface SessionService {
  get(): Promise<SessionPayload | null>;
  start(payload: SessionPayload): Promise<void>;
  end(): Promise<void>;
}
