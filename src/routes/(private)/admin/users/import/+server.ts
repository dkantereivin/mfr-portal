import { LeadershipDepartment, Role } from '$lib/models/user.model';
import { requireRank } from '$lib/utils/auth';
import { LOGIN_REDIRECT_TO, standardCookie } from '$lib/utils/cookies';
import { json, redirect, RequestHandler } from '@sveltejs/kit';
import { MasterSheet } from '$lib/server/sheets/master';
import { User } from '$lib/models/server';

export const GET = (async ({ cookies, locals, url }) => {
    if (!locals.authenticated) {
		cookies.set(LOGIN_REDIRECT_TO, url.href, {
			...standardCookie(),
			maxAge: 5 * 60
		});
		throw redirect(307, '/');
	}

    requireRank(locals.user!, Role.DEPUTY_CHIEF, LeadershipDepartment.ADMINISTRATION);

	const users = await MasterSheet.getActiveRoster();

	const existingEmails = (await User.find({}, {email: 1})).map(({email}) => email);
	const newUsers = users.filter((user) => !existingEmails.includes(user.email.toLowerCase()));

    const added = await User.insertMany(newUsers);
	return json(added);
}) satisfies RequestHandler;
