import type {RequestHandler} from '@sveltejs/kit';
import {SESSION_COOKIE_ID} from '$lib/utils/cookies';
import {redirect} from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const GET = (async ({cookies}) => {
    const id = cookies.get(SESSION_COOKIE_ID);
    await db.session.delete({
        where: {id}
    });
    cookies.delete(SESSION_COOKIE_ID, {path: '/'});
    throw redirect(302, '/');
}) satisfies RequestHandler;
