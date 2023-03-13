// import type { IUser } from '$lib/models';
import { redis, sessionKey } from '$lib/server/redis';
import { SESSION_COOKIE_ID } from '$lib/utils/cookies';
import type {Handle} from '@sveltejs/kit';


export const handle = (async ({ event, resolve }) => {
    const sessionId = event.cookies.get(SESSION_COOKIE_ID);
    if (!sessionId) {
        event.locals.authenticated = false;
        return resolve(event);
    }

    const session = await redis.get(sessionKey(sessionId));
    if (!session) {
        event.cookies.delete(SESSION_COOKIE_ID, {path: '/'});
        event.locals.authenticated = false;
        return resolve(event);
    }

    event.locals.authenticated = true;
    event.locals.user = JSON.parse(session);

    return resolve(event);
}) satisfies Handle;
