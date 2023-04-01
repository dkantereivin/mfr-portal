import { OAuth2Client } from 'google-auth-library';
import { getSecret } from './doppler';
import { env } from '$env/dynamic/private'

// console.log(await getSecret('GOOGLE_OAUTH_CALLBACK_URI'));
// console.log(env.ORIGIN);

const client = new OAuth2Client(
	await getSecret('GOOGLE_CLIENT_ID'),
	await getSecret('GOOGLE_CLIENT_SECRET'),
	await getSecret('GOOGLE_OAUTH_CALLBACK_URI')
);

export { client };
