import type {PageServerLoad} from './$types';
import {db} from '$lib/server/db';
import { Role } from '@prisma/client';
import { requireRank } from '$lib/utils/auth';
import { randomString } from '$lib/utils/misc';
import dayjs from 'dayjs';
import { localTime } from '$lib/utils/dates';

export const load = (async ({locals}) => {
    requireRank(locals.user!, Role.CORPORAL);

    const existingCode = await db.attendanceCode.findFirst({
        where: {
            officerId: locals.user!.id,
            expiresAt: {
                gte: new Date()
            },
            custom: false
        }
    });
    if (existingCode) {
        return {code: existingCode.code};
    }

    const code = randomString(6).toUpperCase();
    await db.attendanceCode.create({
        data: {
            code,
            expiresAt: localTime().endOf('day').utc().toDate(),
            officerId: locals.user!.id
        }
    });

    return {code};

}) satisfies PageServerLoad;