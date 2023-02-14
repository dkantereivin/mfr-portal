import type {PageServerLoad} from './$types';
import {db} from '$lib/server/db';
import dayjs, { Dayjs } from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import { LeadershipDepartment, Role, User } from '@prisma/client';
import _ from 'lodash';
import { requireRank } from '$lib/utils/auth';
import { Actions, error, fail } from '@sveltejs/kit';
import { HoursEntry, HoursSheet } from '$lib/server/sheets/hours';

dayjs.extend(weekday); // todo: test cases

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
    requireRank(
        locals.user!, Role.CORPORAL,
        [LeadershipDepartment.ADMINISTRATION, LeadershipDepartment.TRAINING]
    );
    
    const fromCustom = dayjs(url.searchParams.get('from'))
    const toCustom = dayjs(url.searchParams.get('to'))

    const from = fromCustom.isValid() ? fromCustom : dayjs().subtract(6, 'week');
    const to = toCustom.isValid() ? toCustom : dayjs();
    

    const users = await db.user.findMany({
        include: {
            attendance: {
                where: {
                    time: {
                        gte: from.toDate(),
                        lte: to.toDate()
                    }
                }
            }
        },
        where: {
            role: {
                not: Role.NONE
            }
        }
    });

    const periodicTrainingDates = getDatesBetween(from, to, 2).reverse();

    const memberAttendance: {user: User, attendanceDates: Record<string, boolean>}[] = [];
    users.forEach((user) => {
        const attendanceByDate = _.groupBy(user.attendance, (attendance) => dayjs(attendance.time).format('YYYY-MM-DD'));
        const attendanceDatesForMember: Record<string, boolean> = {}; // date -> attended?
        periodicTrainingDates.map((date) => {
            const key = date.format('YYYY-MM-DD')
            const attendances = attendanceByDate[key] ?? [];
            attendanceDatesForMember[key] = attendances.some(att => dayjs(att.time).hour() >= 17);
        });
        memberAttendance.push({
            user,
            attendanceDates: attendanceDatesForMember
        });
    });

    const finalizedVector = await Promise.all(periodicTrainingDates.map(
        async (date) => 0 < (await db.attendance.count({
            where: {
                isFinalized: true,
                time: {
                    gte: date.startOf('day').toDate(),
                    lte: date.endOf('day').toDate()
                }
            }
        }))
    ));

    const trainingDates = periodicTrainingDates.map(d => d.toDate());
    
    return {
        trainingDates,
        memberAttendance,
        finalizedDates: _.zip(trainingDates, finalizedVector)};
}) satisfies PageServerLoad;

export const actions = {
    create: async ({locals, request}) => {
        requireRank(
            locals.user!, Role.CORPORAL,
            [LeadershipDepartment.ADMINISTRATION, LeadershipDepartment.TRAINING]
        );

        const data = await request.formData();
        const date = dayjs(<string>data.get('date')).hour(17).minute(0).second(0);
        const userId = <string>data.get('userId');

        if (!date.isValid()) {
            return fail(400, {message: 'Unexpected Error: Invalid date.'});
        }

        return await db.attendance.create({
            data: {
                time: date.toDate(),
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
        const date = dayjs(<string>data.get('date'));
        const userId = <string>data.get('userId');

        if (!date.isValid()) {
            return fail(400, {message: 'Unexpected Error: Invalid date.'});
        }

        await db.attendance.deleteMany({
            where: {
                userId,
                time: {
                    gte: date.startOf('day').toDate(),
                    lte: date.endOf('day').toDate()
                }
            }
        });

        return 'OK';           
    },

    export: async ({locals, request}) => {
        requireRank(locals.user!, Role.CORPORAL, LeadershipDepartment.ADMINISTRATION);

        const data = await request.formData();
        const date = dayjs(<string>data.get('date'));
        const hours = <number | null>data.get('hrs') ?? 2;

        if (!date.isValid()) {
            return fail(400, {message: 'Unexpected Error: Invalid date.'});
        }
        
        await db.attendance.updateMany({
            where: {
                time: {
                    gte: date.startOf('day').toDate(),
                    lte: date.endOf('day').toDate()
                }
            },
            data: {
                isFinalized: true
            }
        });

        const attendances = await db.attendance.findMany({
            where: {
                time: {
                    gte: date.hour(17).minute(0).toDate(),
                    lte: date.endOf('day').toDate()
                }
            },
            include: {
                user: true
            },
            distinct: ['userId']
        });

        const users = attendances.map(a => a.user);
        const entry: HoursEntry = {date, hours};

        console.log(`Users:` + users.map(u => u.lastName).join(', '));
        await HoursSheet.addMultipleMemberHours(users, 'training', entry);

        return 'OK';
    }
} satisfies Actions;