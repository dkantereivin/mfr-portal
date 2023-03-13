import type {PageServerLoad} from './$types';
import {db} from '$lib/server/db';
import type { Dayjs } from 'dayjs';
import {dayjs, localTime, parseDate, parseLocal, parseUtc, trainingTimeForDate} from '$lib/utils/dates';
// import { User } from '@prisma/client';
import _ from 'lodash';
import { requireManageAttendance, requireRank } from '$lib/utils/auth';
import { Actions, error, fail } from '@sveltejs/kit';
import { HoursEntry, HoursSheet } from '$lib/server/sheets/hours';
import { Attendance, IUser, LeadershipDepartment, Role, User } from '$lib/models';

const getNext = (dayOfWeek: number, from: Dayjs) => {
    const next = from.weekday(dayOfWeek);
    return next.isBefore(from, 'day') ? next.add(1, 'week') : next;
}

function getDatesBetween(from: Dayjs, to: Dayjs, dayOfWeek: number) {
    const dates = [];
    from = getNext(dayOfWeek, from);
    while (from.isBefore(to) || from.isSame(to)) {
        dates.push(from);
        from = from.add(1, 'week');
    }
    return dates;
}

export const load = (async ({url, locals}) => {
    requireManageAttendance(locals.user!);
    
    const fromCustom = parseDate(url.searchParams.get('from'));
    const toCustom = parseDate(url.searchParams.get('to'));

    const from = fromCustom.isValid() ? fromCustom : localTime().subtract(6, 'week');
    const to = toCustom.isValid() ? toCustom : localTime().endOf('day');
    
    const users = await User.find({
        role: {$ne: Role.NONE}
    });

    const periodicTrainingDates = getDatesBetween(from, to, 2).reverse(); // local
    type MemberAttendance = {user: IUser, attendanceDates: Record<string, boolean>};
    const finalizedDates: Map<string, boolean> = new Map();
    const memberAttendance: MemberAttendance[] = users.map(user => ({
        user,
        attendanceDates: _.fromPairs(periodicTrainingDates.map(date => {
            const key = date.format('YYYY-MM-DD');
            const attendance = user.attendance.find(
                a => parseUtc(a.timestamp).tz().isSame(date, 'day') && parseUtc(a.timestamp).tz().hour() >= 17
            );
            if (attendance && attendance.finalized) {
                finalizedDates.set(key, true); 
            }
            return [key, !!attendance];
        }))
    }));

    

    return {
        memberAttendance,
        finalizedDates: <[string, boolean][]>Object.entries(finalizedDates)
    };
}) satisfies PageServerLoad;

export const actions = {
    create: async ({locals, request}) => {
        requireManageAttendance(locals.user!);

        const data = await request.formData();
        const date = trainingTimeForDate(<string>data.get('date'));
        const userId = <string>data.get('userId');

        if (!date.isValid()) {
            return fail(400, {message: 'Unexpected Error: Invalid date.'});
        }

        return await db.attendance.create({
            data: {
                time: date.utc().toDate(),
                code: `MANUAL: ${locals.user!.firstName} ${locals.user!.lastName}`,
                user: {
                    connect: {
                        id: userId
                    }
                }
            }
        });
    },

    delete: async ({locals, request}) => {
        requireRank(
            locals.user!, Role.CORPORAL,
            [LeadershipDepartment.ADMINISTRATION, LeadershipDepartment.TRAINING]
        );

        const data = await request.formData();
        const date = parseDate(<string>data.get('date'));
        const userId = <string>data.get('userId');

        if (!date.isValid()) {
            return fail(400, {message: 'Unexpected Error: Invalid date.'});
        }

        await db.attendance.deleteMany({
            where: {
                userId,
                time: {
                    gte: date.startOf('day').utc().toDate(),
                    lte: date.endOf('day').utc().toDate()
                }
            }
        });

        return 'OK';
    },

    export: async ({locals, request}) => {
        requireRank(locals.user!, Role.CORPORAL, LeadershipDepartment.ADMINISTRATION);

        const data = await request.formData();
        const dateStr = <string>data.get('date');
        const date = parseDate(dateStr);
        const hours = <number | null>data.get('hours') ?? 2;

        if (!date.isValid()) {
            return fail(400, {message: 'Unexpected Error: Invalid date.'});
        }
        
        await db.attendance.updateMany({
            where: {
                time: {
                    gte: date.startOf('day').utc().toDate(),
                    lte: date.endOf('day').utc().toDate()
                }
            },
            data: {
                isFinalized: true
            }
        });

        const attendances = await db.attendance.findMany({
            where: {
                time: {
                    gte: trainingTimeForDate(dateStr).utc().toDate(),
                    lte: trainingTimeForDate(dateStr).endOf('day').utc().toDate()
                }
            },
            include: {
                user: true
            },
            distinct: ['userId']
        });

        const users = attendances.map(a => a.user);
        const entry: HoursEntry = {date, hours};

        await HoursSheet.addMultipleMemberHours(users, 'training', entry);

        return 'OK';
    }
} satisfies Actions;