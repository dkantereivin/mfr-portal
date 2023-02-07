// delete cookie
import type {RequestHandler} from '@sveltejs/kit';
import {SESSION_COOKIE_ID} from '$lib/utils/cookies';
import {redirect} from '@sveltejs/kit';

export const GET = (async ({cookies}) => {
    cookies.delete(SESSION_COOKIE_ID, {path: '/'});
    throw redirect(302, '/');
}) satisfies RequestHandler;
