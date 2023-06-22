import { OAuth2Client } from 'google-auth-library';
import { env } from '$env/dynamic/private'
import type { GoogleOAuthInfo } from '$lib/models/user.model';

const client = new OAuth2Client(
	env.GOOGLE_CLIENT_ID,
	env.GOOGLE_CLIENT_SECRET,
	env.GOOGLE_OAUTH_CALLBACK_URI
);

export { client };

export function createGoogleApiClient(info: GoogleOAuthInfo) {
	const client = new OAuth2Client(
		env.GOOGLE_CLIENT_ID,
		env.GOOGLE_CLIENT_SECRET
	);

	client.setCredentials({
		access_token: info.accessToken,
		refresh_token: info.refreshToken,
		expiry_date: info.expiryDate,
		scope: info.scopes.join(' ')
	});

	return client;
}