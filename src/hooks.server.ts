import { db } from '$lib/server/db';
import { SESSION_COOKIE_ID } from '$lib/utils/cookies';
import type {Handle} from '@sveltejs/kit';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault("America/Toronto");

export const handle = (async ({ event, resolve }) => {
    const sessionId = event.cookies.get(SESSION_COOKIE_ID);
    if (!sessionId) {
        event.locals.authenticated = false;
        return resolve(event);
    }

    const session = await db.session.findFirst({
        where: {
            id: sessionId
        },
        include: {
            user: true
        }
    });

    if (!session || session.expiresAt < new Date()) {
        event.cookies.delete(SESSION_COOKIE_ID, {path: '/'});
        event.locals.authenticated = false;
        return resolve(event);
    }

    event.locals.authenticated = true;
    event.locals.user = session.user;

    return resolve(event);
}) satisfies Handle;
