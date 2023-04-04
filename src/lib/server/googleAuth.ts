import { OAuth2Client } from 'google-auth-library';
import { env } from '$env/dynamic/private'

const client = new OAuth2Client(
	env.GOOGLE_CLIENT_ID,
	env.GOOGLE_CLIENT_SECRET,
	env.GOOGLE_OAUTH_CALLBACK_URI
);

export { client };
