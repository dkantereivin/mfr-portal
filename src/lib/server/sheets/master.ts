import { loadSheet } from '$lib/server/sheets/common';
import type { GoogleSpreadsheetRow } from 'google-spreadsheet';
import { type IUser, Role, LeadershipDepartment } from '$lib/models/client';

const SHEET_ID = '1Pj8jL_Pwae2wNqk57w5BICy4FcCk5UxdqqgmYP497Hk';

export class MasterSheet {
	static async getUsers(): Promise<GoogleSpreadsheetRow[]> {
		const doc = await loadSheet(SHEET_ID);
		const sheet = doc.sheetsByIndex[0];
		await sheet.loadHeaderRow(2);

		return await sheet.getRows();
	}

	static async getActiveRoster(): Promise<IUser[]> {
		const doc = await loadSheet(SHEET_ID);
		const sheet = doc.sheetsByIndex[0];
		await sheet.loadHeaderRow(2);
		const rows = await sheet.getRows();

		const activeRows = rows.filter((row) => ['Active', 'LOA'].includes(row['Status']));
		const users = activeRows.map((row) => ({
			preferredName: row['Preferred Name'] ?? null,
			firstName: row['Given Names'],
			lastName: row['Surname'],
			email: row['SJA Email Address'],
			contId: row['Member ID'],
			role: this.parseRank(row['Rank']),
			dept: row['Leadership Department']
		} as IUser));

		return users;
	}

	static async getUserData(email: string) {
		const doc = await loadSheet(SHEET_ID);
		const sheet = doc.sheetsByIndex[0];
		await sheet.loadHeaderRow(2);

		const rows = await sheet.getRows();
		const user = rows.find(
			(row) => row['SJA Email Address']?.toLowerCase() === email.toLowerCase()
		);
		if (!user) return null;
		return {
			contId: <string>user['Member ID'],
			firstName: <string>user['Given Names'],
			lastName: <string>user['Surname'],
			role: this.parseRank(user['Rank']),
			dept: <LeadershipDepartment>user['Leadership Department']
		} satisfies Partial<IUser>;
	}

	private static parseRank(rank: string): Role {
		switch (rank) {
			case 'Apprentice':
				return Role.APPRENTICE;
			case 'Member':
				return Role.MEMBER;
			case 'Corporal (^^)':
				return Role.CORPORAL;
			case 'Sergeant (^^^)':
				return Role.SERGEANT;
			case 'Probationary Officer (*)':
				return Role.DEPUTY_CHIEF;
			case 'Deputy Chief (**)':
				return Role.DEPUTY_CHIEF;
			case 'Chief (***)':
				return Role.UNIT_CHIEF;
			default:
				return Role.NONE;
		}
	}
}
