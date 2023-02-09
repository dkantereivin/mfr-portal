import {GoogleSpreadsheet} from 'google-spreadsheet';
import {env} from '$env/dynamic/private';

export async function loadSheet(id: string) {
    const credentials = JSON.parse(Buffer.from(env.GOOGLE_SERVICE_ACCOUNT, 'base64').toString('utf-8'));
    const doc = new GoogleSpreadsheet(id);
    await doc.useServiceAccountAuth(credentials);
    await doc.loadInfo();
    return doc;
}
