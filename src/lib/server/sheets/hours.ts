import type {GoogleSpreadsheet} from 'google-spreadsheet';
import {loadSheet} from '$lib/server/sheets/common';
import { Role, User } from '@prisma/client';
import _ from 'lodash';
import type { Dayjs } from 'dayjs';
import { dayjs, parseDate, parseLocal } from '$lib/utils/dates';

const SHEET_ID = '10k2sYrCXDhRoa-89_QE4IAbKuyDjLSzanOD9j84ZJH0';

type PartialUser = Pick<User, 'firstName' | 'lastName' | 'contId'>;
type PartialUserWithRole = PartialUser & {role: User['role']};

export type HoursEntry = {
    date: string | Dayjs;
    event?: string;
    hours: number;
}

// Must use an actual cell for the top left of the range.
// The bottom right can be a range.
const ranges = {
    events: 'A7:C',
    admin: 'E7:G',
    training: 'I7:J',
    summary: 'L7:M'
}

const hasThreeCols = (category: keyof typeof ranges) => !['training', 'summary'].includes(category);

// todo: consider making this non-static to allow sheet to be cached
export class HoursSheet {
    /**
     * Gets the appropriate sheet for a member. Does not load cells.
     * @param user Partial User object with names and contId.
     */
    static async getMemberPage(user: PartialUser, doc?: GoogleSpreadsheet) {
        if (!doc) {
            doc = await loadSheet(SHEET_ID);
        }
    
        const sheetName = `${user.lastName}, ${user.firstName}`;
        const sheet = doc.sheetsByTitle[sheetName];

        if (!sheet) {
            throw new Error(`No sheet found for ${sheetName}`);
        }

        await sheet.loadCells('A1');

        const header = sheet.getCellByA1('A1').value.toString().trim();
        if (!header.endsWith(user.contId)) {
            throw new Error(`Sheet name does not match SJA ID for ${sheetName}`);
        }

        return sheet;
    }

    static async getMemberHours(user: PartialUser, category: keyof typeof ranges, doc?: GoogleSpreadsheet) {
        const sheet = await this.getMemberPage(user, doc);

        const range = ranges[category];
        await sheet.loadCells(range);

        const [topLeft, ] = range.split(':');
        const {rowIndex, columnIndex} = sheet.getCellByA1(topLeft);

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
    static async addMemberHours(
        user: PartialUserWithRole,
        category: Exclude<keyof typeof ranges, 'summary'>,
        entry: HoursEntry,
        doc?: GoogleSpreadsheet
    ) {
        // todo: remove code duplication
        const sheet = await this.getMemberPage(user, doc);
        const range = ranges[category];
        await sheet.loadCells(range);

        const [topLeft, ] = range.split(':');
        const {rowIndex, columnIndex} = sheet.getCellByA1(topLeft);

        if (!dayjs.isDayjs(entry.date)) {
            entry.date = parseDate(entry.date);
        }
        entry.date = entry.date.tz();

        let i;
        for (i = rowIndex; i < sheet.rowCount; i++) {
            let dateString = <string>sheet.getCell(i, columnIndex).value;
            if (!dateString) break;
            
            // try to parse the date
            if (dateString.endsWith('e')) {
                dateString = dateString.slice(0, -1);
            }

            // if only a month is given, assume the first of the month
            const date = parseLocal(dateString).isValid() ? parseLocal(dateString) : parseLocal(dateString + ' 1');
            // if the date is still invalid, let's just keep looking.
            if (!date.isValid()) continue;

            // if we found the right row, we can now insert the new row
            if (date.isAfter(entry.date)) break;
        }

        if (i === sheet.rowCount) {
            await sheet.resize({rowCount: ++sheet.rowCount});
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
        const formatted = entry.date.format(category === 'admin' ? 'MMM' : 'MMM D');
        sheet.getCell(i, columnIndex).value = (user.role === Role.APPRENTICE && category === 'events') ? formatted + 'e' : formatted;
        if (hasThreeCols(category)) {
            sheet.getCell(i, columnIndex + 1).value = entry.event!;
            sheet.getCell(i, columnIndex + 2).value = entry.hours;
        } else {
            sheet.getCell(i, columnIndex + 1).value = entry.hours;
        }

        await sheet.saveUpdatedCells();
    }

    static async addMultipleMemberHours(
        users: PartialUserWithRole[], 
        category: Exclude<keyof typeof ranges, 'summary'>,
        entries: HoursEntry | HoursEntry[]
    ) {
        const doc = await loadSheet(SHEET_ID);
        const promises = users.map((user, idx) => {
            const entry = Array.isArray(entries) ? entries[idx] : entries;
            return this.addMemberHours(user, category, entry, doc);
        });
        await Promise.all(promises);
    }

    private static parseRow(row: [string, number] | [string, string, number]): HoursEntry {
        let [date, event = undefined, hours = undefined] = row;
        if (typeof event === 'number' || hours === undefined) {
            [event, hours] = [undefined, <number>event];
        }
        return {date, event, hours};
    }
}