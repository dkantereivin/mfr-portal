import type {PageLoad} from './$types';
import type {Load} from '@sveltejs/kit';
import { LOGIN_REDIRECT_TO, SESSION_COOKIE_ID, standardCookie } from '$lib/utils/cookies';
import { redirect } from '@sveltejs/kit';

export const load = (async ({cookies, url, locals}) => {
    if (!locals.authenticated) {
        cookies.set(LOGIN_REDIRECT_TO, url.href, {
            ...standardCookie(),
            maxAge: 5 * 60
        });
        throw redirect(307, '/');
    }

    return { // TODO: limit to client side properties/public
        user: locals.user
    };
    
}) satisfies Load;