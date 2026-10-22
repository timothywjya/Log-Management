import type { SessionService } from "@/application/ports/session.service";

export class SignOut {
  constructor(private readonly session: SessionService) {}

  async execute(): Promise<void> {
    await this.session.end();
  }
}
