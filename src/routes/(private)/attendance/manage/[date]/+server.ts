import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { requireRank } from '$lib/utils/auth';
import { Role, LeadershipDepartment } from '@prisma/client';
import dayjs from 'dayjs';
import { json } from '@sveltejs/kit';

// TODO: note that all dates are WRONG using old technique
// TODO: move to form action
export const PUT = (async ({ request, locals }) => {
	requireRank(locals.user!, Role.CORPORAL, [
		LeadershipDepartment.ADMINISTRATION,
		LeadershipDepartment.TRAINING
	]);

	const { memberId, time } = await request.json();
	const date = dayjs().set('date', dayjs(time).date());
	const attendance = await db.attendance.create({
		data: {
			code: locals.user.firstName!.toUpperCase(),
			time: date.toDate(),
			user: {
				connect: { id: memberId }
			}
		}
	});

	return json(attendance);
}) satisfies RequestHandler;

export const DELETE = (async ({ request, locals }) => {
	requireRank(locals.user!, Role.CORPORAL, [
		LeadershipDepartment.ADMINISTRATION,
		LeadershipDepartment.TRAINING
	]);

	const { id } = await request.json();
	await db.attendance.delete({
		where: { id }
	});
	return new Response('OK');
}) satisfies RequestHandler;
