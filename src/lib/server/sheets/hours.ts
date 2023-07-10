import type { GoogleSpreadsheet } from 'google-spreadsheet';
import { loadSheetOAuth } from '$lib/server/sheets/common';
import { Role, IUser } from '$lib/models/client';
import _ from 'lodash';
import type { Dayjs } from 'dayjs';
import { dayjs, parseDate, parseLocal } from '$lib/utils/dates';
import type { OAuth2Client } from 'google-auth-library';

const SHEET_ID = '10k2sYrCXDhRoa-89_QE4IAbKuyDjLSzanOD9j84ZJH0';

type PartialUser = Pick<IUser, 'firstName' | 'lastName' | 'contId'>;
type PartialUserWithRole = PartialUser & { role: IUser['role'] };

export type HoursEntry = {
	date: string | Dayjs;
	event?: string;
	hours: number;
};

// Must use an actual cell for the top left of the range.
// The bottom right can be a range.
const ranges = {
	events: 'A7:C',
	admin: 'E7:G',
	training: 'I7:J',
	summary: 'L7:M'
};

const hasThreeCols = (category: keyof typeof ranges) => !['training', 'summary'].includes(category);

// todo: consider making this non-static to allow sheet to be cached
export class HoursSheet {
	constructor(private authClient: OAuth2Client) {}

	/**
	 * Gets the appropriate sheet for a member. Does not load cells.
	 * @param user Partial User object with names and contId.
	 */
	async getMemberPage(user: PartialUser, doc?: GoogleSpreadsheet) {
		if (!doc) {
			doc = await loadSheetOAuth(SHEET_ID, this.authClient);
		}

		const sheetName = `${user.lastName}, ${user.firstName}`;
		const sheet = doc.sheetsByTitle[sheetName];

		if (!sheet) {
			throw new Error(`No sheet found for ${sheetName}`);
		}

		await sheet.loadCells('A1');

		const header = sheet.getCellByA1('A1').value.toString().trim();
		if (user.contId && !header.endsWith(user.contId)) {
			throw new Error(`Sheet name does not match SJA ID for ${sheetName}`);
		}

		return sheet;
	}

	async getMemberHours(
		user: PartialUser,
		category: keyof typeof ranges,
		doc?: GoogleSpreadsheet
	) {
		const sheet = await this.getMemberPage(user, doc);

		const range = ranges[category];
		await sheet.loadCells(range);

		const [topLeft] = range.split(':');
		const { rowIndex, columnIndex } = sheet.getCellByA1(topLeft);

		const entries: HoursEntry[] = [];
		for (let i = rowIndex; i < sheet.rowCount; i++) {
			const date = <string>sheet.getCell(i, columnIndex).value;
			if (!date) continue;

			const mid = sheet.getCell(i, columnIndex + 1).value;

			if (hasThreeCols(category)) {
				const right = <number>sheet.getCell(i, columnIndex + 2).value;
				entries.push(this.parseRow([date, mid.toString(), right]));
			} else {
				entries.push(this.parseRow([date, <number>mid]));
			}
		}
		return entries;
	}

	// note: there is a theoretical edge case: if the member is an MFR at entry time, but not at the time of an event, the hours will be counted as MFR hours.
	// there is also a limitation of the software about officer apprentices, which is a TODO
	async addMemberHours(
		user: PartialUserWithRole,
		category: Exclude<keyof typeof ranges, 'summary'>,
		entry: HoursEntry,
		doc?: GoogleSpreadsheet
	): Promise<number> {
		// todo: remove code duplication
		const sheet = await this.getMemberPage(user, doc);
		const range = ranges[category];
		await sheet.loadCells(range);
		await sheet.loadCells(ranges['summary']); // always load summary cells
		
		const hoursBeforeChanges = sheet.getCellByA1('M7').value as number;

		const [topLeft] = range.split(':');
		const { rowIndex, columnIndex } = sheet.getCellByA1(topLeft);

		if (!dayjs.isDayjs(entry.date)) {
			entry.date = parseDate(entry.date);
		}
		entry.date = entry.date.tz();

		let i; // search for the row to insert
		for (i = rowIndex; i < sheet.rowCount; i++) {
			let dateString = <string>sheet.getCell(i, columnIndex).value?.toString();
			if (!dateString) break;

			// try to parse the date
			if (dateString.endsWith('e')) {
				dateString = dateString.slice(0, -1);
			}

			// if only a month is given, assume the first of the month
			let date;
			if (dayjs(dateString).isValid()) {
				date = parseLocal(dateString);
			} else if (dayjs(dateString + ' 1').isValid()) {
				date = parseLocal(dateString + ' 1');
			} else {
				continue;
			}

			// if the date is still invalid, let's just keep looking.
			if (!date.isValid()) continue;

			// if we found the right row, we can now insert the new row
			if (date.isAfter(entry.date)) break;
		}

		// add more rows if needed
		if (i === sheet.rowCount) {
			await sheet.resize({ rowCount: ++sheet.rowCount });
		}

		// shift all rows down
		for (let j = sheet.rowCount - 1; j > i; j--) {
			sheet.getCell(j, columnIndex).value = sheet.getCell(j - 1, columnIndex).value;
			sheet.getCell(j, columnIndex + 1).value = sheet.getCell(j - 1, columnIndex + 1).value;
			if (hasThreeCols(category)) {
				sheet.getCell(j, columnIndex + 2).value = sheet.getCell(j - 1, columnIndex + 2).value;
			}
		}

		// insert the new row
		const formatted = entry.date.format(category === 'admin' ? 'MMM' : 'MMM D'); // special format for admin hours
		// add the date, with an 'e' suffix if its an app on an event
		sheet.getCell(i, columnIndex).value =
			user.role === Role.APPRENTICE && category === 'events' ? formatted + 'e' : formatted;
		if (hasThreeCols(category)) {
			sheet.getCell(i, columnIndex + 1).value = entry.event!;
			sheet.getCell(i, columnIndex + 2).value = entry.hours;
		} else {
			sheet.getCell(i, columnIndex + 1).value = entry.hours;
		}

		await sheet.saveUpdatedCells();

		const hoursNow = sheet.getCellByA1('M7').value as number;
		return hoursNow - hoursBeforeChanges;
	}

	// todo - urgent: deal with member no exist/page not found error
	async addMultipleMemberHours(
		users: PartialUserWithRole[],
		category: Exclude<keyof typeof ranges, 'summary'>,
		entries: HoursEntry | HoursEntry[]
	): Promise<{errors: string[]}> {
		const doc = await loadSheetOAuth(SHEET_ID, this.authClient);
		
		const promises = users.map((user, idx) => {
			const entry = Array.isArray(entries) ? entries[idx] : entries;
			return this.addMemberHours(user, category, entry, doc)
				.catch((err) => {
					return `Error adding hours for ${user.firstName} ${user.lastName}: ${err}`
				});
		});
		await Promise.all(promises);
		return {
			errors: promises.filter(p => typeof p === 'string') as any[] as string[],
		}
	}

	private parseRow(row: [string, number] | [string, string, number]): HoursEntry {
		let [date, event = undefined, hours = undefined] = row;
		if (typeof event === 'number' || hours === undefined) {
			[event, hours] = [undefined, <number>event];
		}
		return { date, event, hours };
	}
}
