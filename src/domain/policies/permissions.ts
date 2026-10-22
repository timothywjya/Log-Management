export type AccessUser = { role_id: number | null; group_id: number | null };
export const ADMIN_ROLE_ID = 1;
export const ADMIN_GROUP_ID = 6;

const CROSS_GROUP_ROLE_IDS = [4, 5, 8, 9];
const OWN_GROUP_MANAGER_ROLE_IDS = [3];

const MEMBER_MANAGER_ROLE_IDS: Record<number, number[]> = {
    1: [3, 4, 5],
    2: [7, 8, 9]
};

export const isAdmin = (u: AccessUser) =>
    u.role_id === ADMIN_ROLE_ID || u.group_id === ADMIN_GROUP_ID;

export const canSeeAllPrograms = (u: AccessUser) =>
    isAdmin(u) || CROSS_GROUP_ROLE_IDS.includes(u.role_id ?? -1);

export const isLockedToOwnGroup = (u: AccessUser) => !canSeeAllPrograms(u);

export const canManageProgram = (u: AccessUser, programGroupId: number) =>
    canSeeAllPrograms(u) ||
    (OWN_GROUP_MANAGER_ROLE_IDS.includes(u.role_id ?? -1) &&
        u.group_id === programGroupId);

export function canManageTeamMember(
    actor: AccessUser,
    memberGroupLevel: number | null
) {
    if (actor.role_id === ADMIN_ROLE_ID) return true;
    if (memberGroupLevel === null) return false;
    return (MEMBER_MANAGER_ROLE_IDS[memberGroupLevel] ?? []).includes(
        actor.role_id ?? -1
    );
}
