import {Role} from '@prisma/client';

export const ROLE_RANKING: Role[] = [
    Role.NONE,
    Role.APPRENTICE,
    Role.MEMBER,
    Role.CORPORAL,
    Role.SERGEANT,
    Role.DEPUTY_CHIEF,
    Role.UNIT_CHIEF,
    Role.SUPER_ADMIN
];

export const getRank = (role: Role): number => ROLE_RANKING.indexOf(role);