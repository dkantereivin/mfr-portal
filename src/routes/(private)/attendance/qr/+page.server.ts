import type {PageServerLoad} from './$types';
import {db} from '$lib/server/db';
import { Role } from '@prisma/client';
import { getRank } from '$lib/server/auth';
import { error } from '@sveltejs/kit';
import { randomString } from '$lib/utils/misc';
import dayjs from 'dayjs';

export const load = (async ({locals}) => {
    if (getRank(locals.user!.role) < getRank(Role.CORPORAL)) {
        throw error(403, 'This page can only be accessed by Corporals and above.');
    }

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
            expiresAt: dayjs().endOf('day').toDate(),
            officerId: locals.user!.id
        }
    });

    return {code};
    
}) satisfies PageServerLoad;