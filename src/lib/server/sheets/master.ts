import {loadSheet} from '$lib/server/sheets/common';
import type {GoogleSpreadsheetRow} from 'google-spreadsheet';
import {type User, Role} from '@prisma/client';

const SHEET_ID = '1aMa2PkALXNkrJ7FLtAkTUYmuuotgJZ_fV9A5UWzw4HQ';
const doc = await loadSheet(SHEET_ID);
const sheet = doc.sheetsByIndex[0];

await sheet.loadHeaderRow(2);

export class MasterSheet {

    static async getUsers(): Promise<GoogleSpreadsheetRow[]> {
        return await sheet.getRows();
    }

    static async getUserData(email: string) {
        const rows = await sheet.getRows();
        const user = rows.find(row => row['SJA Email Address'].toLowerCase() === email.toLowerCase());
        if (!user) return null;
        return {
            contId: <string>user['Member ID'],
            firstName: <string>user['Given Names'],
            lastName: <string>user['Surname'],
            role: this.parseRank(user['Rank']),
        } satisfies Partial<User>;
    }

    private static parseRank(rank: string): Role {
        switch (rank) {
            case 'Apprentice': return Role.APPRENTICE;
            case 'Member': return Role.MEMBER;
            case 'Corporal (^^)': return Role.CORPORAL;
            case 'Sergeant (^^^)': return Role.SERGEANT;
            case 'Probationary Officer (*)': return Role.DEPUTY_CHIEF;
            case 'Deputy Chief (**)': return Role.DEPUTY_CHIEF;
            case 'Chief (***)': return Role.UNIT_CHIEF;
            default: return Role.NONE;
        }
    }
}
