import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (({ locals }) => {
	if (locals.authenticated) {
		throw redirect(307, '/dashboard');
	}
}) satisfies PageServerLoad;
