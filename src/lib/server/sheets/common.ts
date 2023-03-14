import {GoogleSpreadsheet} from 'google-spreadsheet';
import { getSecret } from '../doppler';

const GOOGLE_SERVICE_ACCOUNT = await getSecret('GOOGLE_SERVICE_ACCOUNT');
if (!GOOGLE_SERVICE_ACCOUNT) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT not found.');
}
const credentials = JSON.parse(Buffer.from(GOOGLE_SERVICE_ACCOUNT, 'base64').toString('utf-8'));

export async function loadSheet(id: string) {
    const doc = new GoogleSpreadsheet(id);
    await doc.useServiceAccountAuth(credentials);
    await doc.loadInfo();
    return doc;
}
