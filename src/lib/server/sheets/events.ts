import {loadSheet} from '$lib/server/sheets/common';
import {localTime, parseLocal} from '$lib/utils/dates';
import type {User} from '@prisma/client';

const SHEET_ID = '1pKNVVJU4HdyX5Sa070nqZxK_KIsQIQGGHZgQOkRkZ3Q';

type EventMember = Pick<User, 'firstName' | 'lastName'> & {role: string, meetAt?: 'unit' | 'event'};
export interface CommunityEvent {
    eventNumber: string;
    name: string;
    date: Date;
    meetAtUnit?: string; // no need to bother with dates for now
    meetAtEvent?: string;
    endTime?: string;
    location?: string;
    mfrs: EventMember[];
    apps: EventMember[];
    equipment?: string;
}

export class EventSheet {
    static async forMonth(month: string, year = localTime().year()) {
        const doc = await loadSheet(SHEET_ID);
        const sheet = doc.sheetsByTitle[month];
        await sheet.loadHeaderRow(1);
        const rows = await sheet.getRows({offset: 2});
        return rows
            .filter(row => row['Event #'] && (<string>row['Event #'])?.includes(year.toString()) + '-')
            .map(row => (<CommunityEvent>{
                eventNumber: row['Event #'],
                name: row['Event'],
                date: parseLocal(row['Date']).toDate(),
                meetAtUnit: row['Meet @ St.John'],
                meetAtEvent: row['Meet @\nEvent'] ?? row[' Meet @\nEvent'] ?? row['Meet @ Event'],
                endTime: row['Approx.\nEnd'],
                location: row['Event\nLocation'],
                mfrs: this.parseMFRs(row['Medical First Responders']),
                apps: this.parseApprentices(row['Apprentice']),
            }));
    }

    private static parseMFRs(raw: string): EventMember[] {
        if (!raw) return [];
        const specials = ['C', 'SUP', 'SUP-Trg', 'D', 'Team'];
        if (specials.every(s => !raw.includes(s))) {
            return this.parseApprentices(raw);
        }

        const lines = raw.split('\n').map(line => line.trim());
        const members: EventMember[] = [];
        let ctx: string | undefined;
        for (const line of lines) {
            if (line.includes('Team')) {
                ctx = line;
                continue;
            } else if (line === '') {
                ctx = undefined;
                continue;
            }

            if (line.includes('(App)')) continue;

            const pieces = line.split(' ');
            const specialIdx = pieces.findIndex(p => specials.includes(p));
            const [firstName, ...last] = pieces.slice(0, specialIdx);
            let lastName = last.join(' ');
            const role = specialIdx === -1 ? (ctx ?? 'MFR') : pieces[specialIdx];
            const meetAt = lastName.includes('*') && !lastName.includes('**') ? 'event' : 'unit';
            lastName = lastName.replaceAll('*', '');
            members.push(<EventMember>{
                firstName,
                lastName,
                meetAt,
                role
            })
        }

        return members;
    }

    private static parseApprentices(raw: string): EventMember[] {
        if (!raw) return [];
        const lines = raw.split('\n').map(line => line.trim());
        return lines.map(line => {
            const [firstName, ...rest] = line.split(' ');
            let lastName = rest.join(' ');
            const meetAt = lastName.includes('*') && !lastName.includes('**') ? 'event' : 'unit';
            lastName = lastName.replaceAll('*', '');
            return {firstName, lastName, meetAt, role: 'Apprentice'};
        });
    }
}
