import { db } from "$lib/server/db";
import type { PageServerLoad } from "./$types";

export const load = (async ({locals, url}) => {
    const code = url.searchParams.get('code')?.trim();
    if (!code) return {};

    const fail = (error: string) => ({code, success: false, error});
    
    const attendanceCode = await db.attendanceCode.findUnique({
        where: {code}
    });

    if (!attendanceCode) return fail('The provided code is not recognized.');
    if (attendanceCode.expiresAt < new Date()) fail('The provided code has expired.');

    const {time} = await db.attendance.create({
        data: {
            code,
            user: {
                connect: {id: locals.user!.id}
            }
        }
    });

    return {
        success: true,
        code: '',
        time
    };
}) satisfies PageServerLoad;
