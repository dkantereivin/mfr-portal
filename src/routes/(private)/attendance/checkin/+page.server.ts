import type { PageServerLoad } from "./$types";
import {redirect} from '@sveltejs/kit';
import { Attendance, AttendanceCode, User } from "$lib/models/server";

export const load = (async ({locals, url}) => {
    const code = url.searchParams.get('code')?.trim().toUpperCase();
    if (!code) return {};

    const fail = (error: string) => ({code, success: false, error});

    const attendanceCode = await AttendanceCode.findOne({code});

    if (!attendanceCode) return fail('The provided code is not recognized.');
    if (attendanceCode.validUntil < new Date()) fail('The provided code has expired.');

    const user = await User.findById(locals.user!._id).select('+attendance');
    user!.attendance.push(<Attendance>{
        method: 'code',
        authorization: {
            code: attendanceCode._id
        },
        timestamp: new Date()
    });
    await user!.save();

    throw redirect(307, '/attendance/success');
}) satisfies PageServerLoad;
