import { GoogleSpreadsheet } from 'google-spreadsheet';
import { GOOGLE_SERVICE_ACCOUNT } from '$env/static/private';

const credentials = JSON.parse(Buffer.from(GOOGLE_SERVICE_ACCOUNT, 'base64').toString('utf-8'));

export async function loadSheet(id: string) {
	const doc = new GoogleSpreadsheet(id);
	await doc.useServiceAccountAuth(credentials);
	await doc.loadInfo();
	return doc;
}
