import {loadSheet} from '$lib/server/sheets/common';
import type {GoogleSpreadsheetRow} from 'google-spreadsheet';
import {type User, Role} from '@prisma/client';
import {GoogleSpreadsheet, GoogleSpreadsheetWorksheet} from 'google-spreadsheet';

const SHEET_ID = '1aMa2PkALXNkrJ7FLtAkTUYmuuotgJZ_fV9A5UWzw4HQ';

export class MasterSheet {
    private static doc: GoogleSpreadsheet;
    private static sheet: GoogleSpreadsheetWorksheet;

    static {
        loadSheet(SHEET_ID).then(doc => {
            this.doc = doc;
            this.sheet = doc.sheetsByIndex[0];
            this.sheet.loadHeaderRow(2);
        })
    }

    static async getUsers(): Promise<GoogleSpreadsheetRow[]> {
        return await this.sheet.getRows();
    }

    static async getUserData(email: string) {
        const rows = await this.sheet.getRows();
        const user = rows.find(row => row['SJA Email Address']?.toLowerCase() === email.toLowerCase());
        if (!user) return {};
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
