import {LeadershipDepartment, Role, User} from '@prisma/client';
import { error } from '@sveltejs/kit';

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

export const requireRank = (user: User, role: Role, dept?: LeadershipDepartment | LeadershipDepartment[]): boolean => {
    if (getRank(user.role) < getRank(role))
        throw error(403, 'This page can only be accessed by ' + role + 's and above.');

    if (!dept || user.dept === LeadershipDepartment.ALL) return true;
    if (!user.dept) throw error(403, 'You do not have a leadership department assigned. Please contact your superior.');
    if (typeof dept === 'string') {
        if (dept === LeadershipDepartment.ALL || user.dept === dept) return true;
        throw error(403, "This page can only be accessed by " + dept + " " + role + "s and above.")
    } else {
        if (dept.includes(LeadershipDepartment.ALL) || dept.includes(user.dept)) return true;
        throw error(403, "This page can only be accessed by " + dept.join(', ') + " " + role + "s and above.")
    }
}

export const hasRank = (user: User, role: Role, dept?: LeadershipDepartment | LeadershipDepartment[]): boolean => {
    try {
        return requireRank(user, role, dept);
    } catch (e) {
        return false;
    }
}
