import { error, redirect } from '@sveltejs/kit';
import type { RequestEvent } from './$types';
import { createClient } from '$lib/server/googleAuth';
import { db } from '$lib/server/db';
import { SESSION_COOKIE_ID, hardenedCookie, LOGIN_REDIRECT_TO } from '$lib/utils/cookies';
import dayjs from 'dayjs';
import { MasterSheet } from '$lib/server/sheets/master';
import { utcTime } from '$lib/utils/dates';

export async function GET({ url, cookies }: RequestEvent): Promise<Response> {
	const code = url.searchParams.get('code');

	if (url.searchParams.get('error') || !code) {
		throw error(400, 'Error authenticating with Google.');
	}

	const client = createClient();

	const { tokens } = await client.getToken(code);
	client.setCredentials(tokens);

	const res = await fetch(
		`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`
	);
	const data = await res.json();

	const { refresh_token } = tokens;

	if (!data.email) {
		throw error(400, 'No email provided by Google.');
	}

	let user = await db.user.findFirst({
		where: {
			email: data.email!
		}
	});

	if (!user) {
		if (!refresh_token) {
			throw error(400, 'No refresh token provided by Google.');
		}
		const sjaInfo = await MasterSheet.getUserData(data.email);
		if (!sjaInfo.contId) {
			throw error(400, 'No SJA Alliance ID found. Please contact the web administrator.');
		}

		user = await db.user.create({
			data: {
				firstName: sjaInfo.firstName ?? data.given_name,
				lastName: sjaInfo.lastName ?? data.family_name,
				role: sjaInfo.role ?? 'NONE',
				dept: sjaInfo.dept ?? 'NONE',
				contId: sjaInfo.contId,
				googleId: data.id!,
				email: data.email,
				refreshToken: refresh_token
			}
		});
	} else if (refresh_token) {
		// user exists but Google has sent a new refresh token
		await db.user.update({
			where: {
				id: user.id
			},
			data: {
				refreshToken: refresh_token
			}
		});
	}

	// create session
	const TTL = utcTime()
		.add(12 * 7, 'hours')
		.toDate();
	const session = await db.session.create({
		data: {
			userId: user.id,
			expiresAt: TTL
		}
	});

	cookies.set(SESSION_COOKIE_ID, session.id, hardenedCookie());

	const redirectTo = cookies.get(LOGIN_REDIRECT_TO) ?? '/dashboard';
	cookies.delete(LOGIN_REDIRECT_TO, { path: '/' });
	throw redirect(302, redirectTo);
}
