import {GoogleSpreadsheet} from 'google-spreadsheet';
import {loadSheet} from '$lib/server/sheets/common';

const SHEET_ID = '';

const doc = await loadSheet(SHEET_ID);
