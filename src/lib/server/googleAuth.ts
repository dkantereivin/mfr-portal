import { OAuth2Client } from 'google-auth-library';
import { env } from '$env/dynamic/private'
import type { GoogleOAuthInfo, IUser } from '$lib/models/user.model';
import { User } from '$lib/models/server';

const client = new OAuth2Client(
	env.GOOGLE_CLIENT_ID,
	env.GOOGLE_CLIENT_SECRET,
	env.GOOGLE_OAUTH_CALLBACK_URI
);

export { client };

// allows for one-time creation, or to supply a userId so it will update the user as new tokens are fetched
export function createGoogleApiClient(info: GoogleOAuthInfo, userId?: IUser['_id']) {
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

	client.on('tokens', async ({access_token, refresh_token, scope, expiry_date}) => {
		if (!userId) return;
		const user = await User.findById(userId).select('+google');
		if (!user || !user.google) return;

		if (access_token) {
			user.google.accessToken = access_token;
			user.google.expiryDate = expiry_date!;
			user.google.scopes = scope!.split(' ');
		}

		if (refresh_token) {
			user.google.refreshToken = refresh_token;
		}

		await user?.save();
	});

	return client;
}