import type { IUser } from '$lib/models/server';
import { redis, sessionKey } from '$lib/server/redis';
import { SESSION_COOKIE_ID } from '$lib/utils/cookies';
import type { Handle } from '@sveltejs/kit';

export const handle = (async ({ event, resolve }) => {
	const sessionId = event.cookies.get(SESSION_COOKIE_ID);
	if (!sessionId) {
		event.locals.authenticated = false;
		return resolve(event);
	}

	const session = await redis.get(sessionKey(sessionId));
	if (!session) {
		event.cookies.delete(SESSION_COOKIE_ID, { path: '/' });
		event.locals.authenticated = false;
		return resolve(event);
	}

	try {
		const user = JSON.parse(session) as IUser;
		event.locals.authenticated = true;
		event.locals.user = user;
	} catch (e) {
		if (e instanceof SyntaxError) {
			// malformed session: delete the session id and force a re-login
			event.cookies.delete(SESSION_COOKIE_ID, { path: '/' });
			// todo: implement logging of the malformed session and inform user what happened
			// currently "fails silently" if this were to occur
			await redis.del(sessionKey(sessionId));
		}

		event.locals.authenticated = false;
	}

	return resolve(event);
}) satisfies Handle;
