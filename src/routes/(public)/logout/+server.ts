import type {RequestHandler} from '@sveltejs/kit';
import {SESSION_COOKIE_ID} from '$lib/utils/cookies';
import {redirect} from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { redis, sessionKey } from '$lib/server/redis';

export const GET = (async ({cookies}) => {
    const id = cookies.get(SESSION_COOKIE_ID);
    if (!id) throw redirect(302, '/');

    redis.del(sessionKey(id));
    cookies.delete(SESSION_COOKIE_ID, {path: '/'});
    throw redirect(302, '/');
}) satisfies RequestHandler;
