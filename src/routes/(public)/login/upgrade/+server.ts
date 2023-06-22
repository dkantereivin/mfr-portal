import { SHEETS_SCOPE } from '$lib/server/sheets/common';
import { redirect, RequestEvent } from '@sveltejs/kit';
import { env } from '$env/dynamic/private'
import { OAuth2Client } from 'google-auth-library';
import { isUndefined } from 'lodash';

const defaultScope = [
	'https://www.googleapis.com/auth/userinfo.email',
	'https://www.googleapis.com/auth/userinfo.profile'
];

const extraScopeOptions: Record<string, string> = {
    'sheets': SHEETS_SCOPE
}

export function GET({url, locals}: RequestEvent): Response {
    const callback = url.searchParams.get('callback') ?? env.GOOGLE_OAUTH_CALLBACK_URI;
    const scopeNames = url.searchParams.get('scopes')?.split(',') ?? [];

    const prompt = isUndefined(locals.user?.google?.refreshToken) ? 'consent' : undefined;

    const client = new OAuth2Client(
        env.GOOGLE_CLIENT_ID,
        env.GOOGLE_CLIENT_SECRET,
        callback
    );

    const extraScopes = scopeNames.map(name => extraScopeOptions[name] ?? name);

	const redirectUrl = client.generateAuthUrl({
		access_type: 'offline',
		scope: [...defaultScope, ...extraScopes],
		include_granted_scopes: true,
		hd: 'sjacs.ca',
        prompt
	});

	throw redirect(302, redirectUrl);
}
