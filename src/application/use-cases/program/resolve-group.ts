import { isLockedToOwnGroup } from "@/domain/policies/permissions";
import type { Actor } from "@/application/shared/actor";

/** Group final ditentukan SERVER: role 2/3 selalu dikunci ke group miliknya. */
export function resolveGroupId(actor: Actor, requested?: number) {
  return isLockedToOwnGroup(actor) ? actor.group_id : requested ?? null;
}
