import { redirect } from '@sveltejs/kit';
import { client } from '$lib/server/googleAuth';

const scope = [
	'https://www.googleapis.com/auth/userinfo.email',
	'https://www.googleapis.com/auth/userinfo.profile'
];

export function GET(): Response {
	const url = client.generateAuthUrl({
		access_type: 'offline',
		scope,
		include_granted_scopes: true,
		hd: 'sjacs.ca'
	});

	throw redirect(302, url);
}
