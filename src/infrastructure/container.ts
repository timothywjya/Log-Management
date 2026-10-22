// Composition root: SATU-SATUNYA tempat use case dirakit dengan implementasi konkretnya.
// Lapisan presentasi (pages, actions, route handlers) mengambil use case dari sini.
// Ingin mengganti database, penyedia login, atau rate limiter? Cukup ubah file ini.

import { AuthenticateUser } from "@/application/use-cases/auth/authenticate-user";
import { CompleteProfile } from "@/application/use-cases/auth/complete-profile";
import { GetSessionUser } from "@/application/use-cases/auth/get-session-user";
import { RefreshSession } from "@/application/use-cases/auth/refresh-session";
import { SignOut } from "@/application/use-cases/auth/sign-out";
import { UpdateProfile } from "@/application/use-cases/auth/update-profile";
import { IngestLogs } from "@/application/use-cases/log/ingest-logs";
import { QueryLogs } from "@/application/use-cases/log/query-logs";
import { AuthenticateProgramKey } from "@/application/use-cases/program/authenticate-program-key";
import { CreateProgram } from "@/application/use-cases/program/create-program";
import { DeleteProgram } from "@/application/use-cases/program/delete-program";
import { GetDashboardSummary } from "@/application/use-cases/program/get-dashboard-summary";
import { ListPrograms } from "@/application/use-cases/program/list-programs";
import { RegenerateProgramKey } from "@/application/use-cases/program/regenerate-program-key";
import { RestoreProgram } from "@/application/use-cases/program/restore-program";
import { UpdateProgram } from "@/application/use-cases/program/update-program";
import { ApproveUser } from "@/application/use-cases/user/approve-user";
import { ListPendingRequests } from "@/application/use-cases/user/list-pending-requests";
import { ListTeamMembers } from "@/application/use-cases/user/list-team-members";
import { RejectUser } from "@/application/use-cases/user/reject-user";
import { ToggleUserStatus } from "@/application/use-cases/user/toggle-user-status";
import { CookieSessionService } from "./auth/cookie-session.service";
import { EssIdentityProvider } from "./auth/ess-identity-provider";
import { env } from "./config/env";
import { InMemoryRateLimiter } from "./rate-limit/in-memory-rate-limiter";
import { PrismaLogRepository } from "./repositories/prisma-log.repository";
import { PrismaProgramRepository } from "./repositories/prisma-program.repository";
import { PrismaReferenceRepository } from "./repositories/prisma-reference.repository";
import { PrismaUserRepository } from "./repositories/prisma-user.repository";
import { NodeProgramKeyService } from "./security/node-program-key.service";

// Adapter
const users = new PrismaUserRepository();
const programs = new PrismaProgramRepository();
const reference = new PrismaReferenceRepository();
const logs = new PrismaLogRepository();
const session = new CookieSessionService();
const identity = new EssIdentityProvider();
const keys = new NodeProgramKeyService();
const limiter = new InMemoryRateLimiter();

// Use case
export const container = {
  // auth & profil
  authenticateUser: new AuthenticateUser(users, session, identity, env.essVerifyPassword),
  getSessionUser: new GetSessionUser(users, session),
  refreshSession: new RefreshSession(users, session),
  signOut: new SignOut(session),
  completeProfile: new CompleteProfile(users, session),
  updateProfile: new UpdateProfile(users),

  // program
  listPrograms: new ListPrograms(programs, reference),
  createProgram: new CreateProgram(programs, reference, keys),
  updateProgram: new UpdateProgram(programs),
  deleteProgram: new DeleteProgram(programs),
  restoreProgram: new RestoreProgram(programs),
  regenerateProgramKey: new RegenerateProgramKey(programs, keys),
  authenticateProgramKey: new AuthenticateProgramKey(programs, keys),
  getDashboardSummary: new GetDashboardSummary(users, programs),

  // manajemen user
  listPendingRequests: new ListPendingRequests(users, reference),
  listTeamMembers: new ListTeamMembers(users),
  approveUser: new ApproveUser(users, reference),
  rejectUser: new RejectUser(users),
  toggleUserStatus: new ToggleUserStatus(users),

  // log
  queryLogs: new QueryLogs(logs, programs),
  ingestLogs: new IngestLogs(logs, reference, limiter),
};
