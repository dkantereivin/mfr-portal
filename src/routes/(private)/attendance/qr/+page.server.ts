import type {PageServerLoad} from './$types';
import {db} from '$lib/server/db';
import { Role, LeadershipDepartment } from '$lib/models/user.model';
import { requireManageAttendance } from '$lib/utils/auth';
import { randomString } from '$lib/utils/misc';
import { localTime } from '$lib/utils/dates';
import { AttendanceCode } from '$lib/models';

export const load = (async ({locals}) => {
    requireManageAttendance(locals.user);

    const existingCode = await AttendanceCode.findOne({
        creator: locals.user!._id,
        validUntil: { $gte: new Date() }
    });

    if (existingCode) {
        return {code: existingCode.code};
    }

    const code = randomString(6).toUpperCase();
    await AttendanceCode.create({
        code,
        validUntil: localTime().endOf('day').utc().toDate(),
        creator: locals.user!._id
    })

    return {code};

}) satisfies PageServerLoad;