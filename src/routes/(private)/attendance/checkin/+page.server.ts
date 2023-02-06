import { db } from "$lib/server/db";
import type { PageServerLoad } from "./$types";
import {redirect} from '@sveltejs/kit';

export const load = (async ({locals, url}) => {
    const code = url.searchParams.get('code')?.trim();
    if (!code) return {};

    const fail = (error: string) => ({code, success: false, error});

    const attendanceCode = await db.attendanceCode.findUnique({
        where: {code}
    });

    if (!attendanceCode) return fail('The provided code is not recognized.');
    if (attendanceCode.expiresAt < new Date()) fail('The provided code has expired.');

    await db.attendance.create({
        data: {
            code,
            user: {
                connect: {id: locals.user!.id}
            }
        }
    });

    throw redirect(307, '/attendance/success');
}) satisfies PageServerLoad;
