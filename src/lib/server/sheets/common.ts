import {GoogleSpreadsheet} from 'google-spreadsheet';
import {env} from '$env/dynamic/private';

const credentials = JSON.parse(atob(env.GOOGLE_SERVICE_ACCOUNT));
export async function loadSheet(id: string) {
    const doc = new GoogleSpreadsheet(id);
    await doc.useServiceAccountAuth(credentials);
    await doc.loadInfo();
    return doc;
}
