import { CommunityEvent, EventSheet } from "$lib/server/sheets/events";
import { utcTime } from "$lib/utils/dates";
import { sha256 } from "$lib/utils/misc";
import { error, RequestHandler } from "@sveltejs/kit";
import {Event, IEvent, EventMember, IUser, User} from "$lib/models/server";


const TTL = 10; // minutes
let lastRefresh = utcTime().subtract(TTL, 'minutes');

const guessMember = async (firstName: string, lastName: string): Promise<IUser | null> => {
    const users = await User.find({
        $or: [
            {firstName}, {lastName}, {preferredName: firstName}
        ]
    });

    if (users.length === 0) return null;
    if (users.length === 1) return users[0];

    const matches = users.filter((u) => u.firstName === firstName && u.lastName === lastName);
    return matches.shift() ?? null;
}

const createEvent = async (event: CommunityEvent, _id?: string): Promise<IEvent> => {
    const rawMembers = [...event.mfrs, ...event.apps];
    const members: EventMember[] = [];
    let isValid = true;
    for (const member of rawMembers) {
        const user = await guessMember(member.firstName, member.lastName);
        if (!user) {
            isValid = false;
            continue;
        }

        members.push({
            user: user._id!,
            role: member.role
        });
    }

    const e = new Event({
        _id,
        hash: await sha256(event.hashableFields),
        eventNumber: event.eventNumber,
        name: event.name,
        date: event.date,
        meetAtUnitTime: event.meetAtUnit,
        meetAtEventTime: event.meetAtEvent,
        endTime: event.endTime,
        location: event.location,
        isValid,
        members
    });

    await e.save();
    return e;
}

const updateMonth = async (month: string): Promise<void> => {
    const raw = await EventSheet.forMonth(month);
    for (const event of raw) {
        const existing = await Event.findOne({ eventNumber: event.eventNumber });
        let _id = undefined;
        if (existing) {
            const hash = await sha256(event.hashableFields);
            if (existing.hash === hash) continue;
            await existing.delete();
        }

        await createEvent(event, _id);
    }
}

export const GET = (async () => {
    if (utcTime().subtract(TTL, 'minutes').isBefore(lastRefresh)) {
        throw error(429, `The events cache can be updated at most every ${TTL} minutes.`)
    } else {
        lastRefresh = utcTime();
    }

    await updateMonth(utcTime().format('MMMM'));
    await updateMonth(utcTime().add(1, 'month').format('MMMM'));
    return new Response('OK');
}) satisfies RequestHandler;
