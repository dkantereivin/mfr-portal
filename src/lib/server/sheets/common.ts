import {GoogleSpreadsheet} from 'google-spreadsheet';
import {env} from '$env/dynamic/private';

export async function loadSheet(id: string) {
    const credentials = JSON.parse(atob(env.GOOGLE_SERVICE_ACCOUNT));
    const doc = new GoogleSpreadsheet(id);
    await doc.useServiceAccountAuth(credentials);
    await doc.loadInfo();
    return doc;
}
