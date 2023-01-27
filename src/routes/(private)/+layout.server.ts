import type {LayoutServerLoad} from './$types';
import { LOGIN_REDIRECT_TO, standardCookie } from '$lib/utils/cookies';
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
    
}) satisfies LayoutServerLoad;