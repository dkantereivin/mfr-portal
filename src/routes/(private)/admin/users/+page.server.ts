import { IUser, jsonSanitize, LeadershipDepartment, Role, User } from '$lib/models/server';
import { requireRank } from '$lib/utils/auth';
import { Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals, url }) => {
	requireRank(locals!.user, Role.CORPORAL, LeadershipDepartment.ADMINISTRATION);

	const userId = url.searchParams.get('id');
	const activeUser: IUser | null = userId ? (await User.findById(userId)) ?? null : null;

	const users = await User.find().sort({ lastName: 1 }).exec();

	return jsonSanitize({
		users,
		activeUser
	});
}) satisfies PageServerLoad;

export const actions = {
	editUser: async ({ locals, request }) => {
		const form = await request.formData();
		const id = <string | null>form.get('id');
		if (!id) return fail(400, { message: 'No User ID Provided.' });

		const user = await User.findById(id);
		if (!user) return fail(400, { message: 'User Not Found.' });

		const toRank = <Role>form.get('role');

		requireRank(locals!.user, Role.CORPORAL, LeadershipDepartment.ADMINISTRATION);
		requireRank(locals!.user, user.role);
		requireRank(locals!.user, toRank);

		user.firstName = <string>form.get('firstName');
		user.lastName = <string>form.get('lastName');
		user.email = <string>form.get('email');
		user.contId = <string>form.get('contId');
		user.role = toRank;
		user.dept = <LeadershipDepartment>form.get('dept');
		await user.save();
	},

	deleteUser: async ({ locals, request }) => {
		const form = await request.formData();
		const id = <string | null>form.get('id');
		if (!id) return fail(400, { message: 'No User ID Provided.' });

		const user = await User.findById(id);
		if (!user) return fail(400, { message: 'User Not Found.' });

		requireRank(locals!.user, Role.CORPORAL, LeadershipDepartment.ADMINISTRATION);
		requireRank(locals!.user, user.role);

		await user.deleteOne();

		return 'OK';
	}
} satisfies Actions;
