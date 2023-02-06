import * as fs from 'fs';
import {GoogleSpreadsheet} from 'google-spreadsheet';

const credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));
export async function loadSheet(id: string) {
    const doc = new GoogleSpreadsheet(id);
    await doc.useServiceAccountAuth(credentials);
    await doc.loadInfo();
    return doc;
}
