import type { PageServerLoad } from './$types';
import type { Dayjs } from 'dayjs';
import { localTime, parseDate, parseUtc, trainingTimeForDate } from '$lib/utils/dates';
import _ from 'lodash';
import { requireManageAttendance, requireRank } from '$lib/utils/auth';
import { Actions, fail, redirect } from '@sveltejs/kit';
import { HoursEntry, HoursSheet } from '$lib/server/sheets/hours';
import {
	Attendance,
	LeadershipDepartment,
	Role,
	User
} from '$lib/models/server';
import type { Types } from 'mongoose';
import { SHEETS_SCOPE } from '$lib/server/sheets/common';
import { LOGIN_REDIRECT_TO, standardCookie } from '$lib/utils/cookies';
import { createGoogleApiClient } from '$lib/server/googleAuth';

const getNext = (dayOfWeek: number, from: Dayjs) => {
	const next = from.weekday(dayOfWeek);
	return next.isBefore(from, 'day') ? next.add(1, 'week') : next;
};

function getDatesBetween(from: Dayjs, to: Dayjs, dayOfWeek: number) {
	const dates = [];
	from = getNext(dayOfWeek, from);
	while (from.isBefore(to) || from.isSame(to)) {
		dates.push(from);
		from = from.add(1, 'week');
	}
	return dates;
}

export const load = (async ({ url, locals }) => {
	requireManageAttendance(locals.user!);

	const fromCustom = parseDate(url.searchParams.get('from'));
	const toCustom = parseDate(url.searchParams.get('to'));

	const from = fromCustom.isValid() ? fromCustom : localTime().subtract(6, 'week');
	const to = toCustom.isValid() ? toCustom : localTime().endOf('day');

	const users = await User.find({
		role: { $ne: Role.NONE }
	}).select('+attendance');

	const periodicTrainingDates = getDatesBetween(from, to, 2).reverse(); // local
	type MemberAttendance = { user: Record<string, any>; attendanceDates: Record<string, boolean> };
	const finalizedDates: Map<string, boolean> = new Map(
		periodicTrainingDates.map((date) => [date.format('YYYY-MM-DD'), false])
	);

	const memberAttendance: MemberAttendance[] = users.map((user) => ({
		user,
		attendanceDates: _.fromPairs(
			periodicTrainingDates.map((date) => {
				const key = date.format('YYYY-MM-DD');
				const attendance = user.attendance.find(
					(a) =>
						parseUtc(a.timestamp).tz().isSame(date, 'day') &&
						parseUtc(a.timestamp).tz().hour() >= 17
				);
				if (attendance && attendance.finalized) {
					finalizedDates.set(key, true);
				}
				return [key, !!attendance];
			})
		)
	}));

	return {
		memberAttendance: <MemberAttendance[]>JSON.parse(JSON.stringify(memberAttendance)),
		finalizedDates: <[string, boolean][]>Object.entries(Object.fromEntries(finalizedDates))
	};
}) satisfies PageServerLoad;

export const actions = {
	create: async ({ locals, request }) => {
		requireManageAttendance(locals.user!);
		const data = await request.formData();
		const date = trainingTimeForDate(<string>data.get('date'));
		const userId = <string>data.get('userId');

		if (!date.isValid()) {
			return fail(400, { message: 'Unexpected Error: Invalid date.' });
		}
		const user = await User.findById(userId).select('+attendance');
		if (!user) return fail(400, { message: 'Unexpected Error: Invalid user.' });

		user.attendance.push(<Attendance>{
			method: 'manual',
			authorization: {
				officer: locals.user!._id
			},
			timestamp: date.utc().toDate()
		});

		await user.save();
	},

	delete: async ({ locals, request }) => {
		requireRank(locals.user!, Role.CORPORAL, [
			LeadershipDepartment.ADMINISTRATION,
			LeadershipDepartment.TRAINING
		]);

		const data = await request.formData();
		const date = parseDate(<string>data.get('date'));
		const userId = <string>data.get('userId');

		if (!date.isValid()) {
			return fail(400, { message: 'Unexpected Error: Invalid date.' });
		}

		const user = await User.findById(userId).select('+attendance');
		if (!user) return fail(400, { message: 'Unexpected Error: Invalid user.' });

		user.attendance = user.attendance.filter(
			({ timestamp }) => !parseUtc(timestamp).tz().isSame(date, 'day')
		) as Types.Array<Attendance>;
		await user.save();

		return 'OK';
	},

	export: async ({ url, locals, request, cookies }) => {
		requireRank(locals.user!, Role.CORPORAL, LeadershipDepartment.ADMINISTRATION);

		const {_id: userId} = locals.user!;

		const adminUser = await User.findById(userId).select('+google');
		if (!adminUser?.google?.scopes.includes(SHEETS_SCOPE)) {
			const authUrl = `/login/upgrade?scopes=sheets`;

			cookies.set(LOGIN_REDIRECT_TO, url.href, {
				...standardCookie(),
				maxAge: 5 * 60
			});

			throw redirect(302, authUrl)
		}

		const data = await request.formData();
		const dateStr = <string>data.get('date');
		const date = parseDate(dateStr);
		const hours = <number | null>data.get('hours') ?? 2;

		if (!date.isValid()) {
			return fail(400, { message: 'Unexpected Error: Invalid date.' });
		}

		const users = await User.find({
			attendance: {
				$elemMatch: {
					timestamp: {
						$gte: date.startOf('day').utc().toDate(),
						$lte: date.endOf('day').utc().toDate()
					}
				}
			}
		}).select('+attendance');

		let promises = [];
		for (const user of users) {
			for (const attendance of user.attendance) {
				if (parseUtc(attendance.timestamp).tz().isSame(date, 'day')) {
					attendance.finalized = true;
				}
			}
			promises.push(user.save());
		}
		await Promise.all(promises);

		const entry: HoursEntry = { date, hours };

		const client = createGoogleApiClient(adminUser.google);
		const hoursSheet = new HoursSheet(client);

		await hoursSheet.addMultipleMemberHours(users, 'training', entry);

		return 'OK';
	}
} satisfies Actions;

export const ssr = false;
