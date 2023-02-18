import { db } from "$lib/server/db";
import { CommunityEvent, EventSheet } from "$lib/server/sheets/events";
import { dayjs, localTime } from "$lib/utils/dates";
import { hash, serialize } from "$lib/utils/jsum";
import type { RequestEvent } from "@sveltejs/kit";
import flatten from "lodash/flatten";

const excludeFields = (e: CommunityEvent, fields: (keyof CommunityEvent)[]) => {
    const copy = {...e};
    for (const field of fields) {
        delete copy[field];
    }
    return copy;
}

export async function POST({  }: RequestEvent): Promise<Response> {
    const month = localTime().startOf("month");
    const prevMonth = month.subtract(1, "month");
    const nextMonth = month.add(1, "month");
    
    const eventsByMonth = await Promise.all([
        EventSheet.forMonth(prevMonth.format("MMMM")),
        EventSheet.forMonth(month.format("MMMM")),
        EventSheet.forMonth(nextMonth.format("MMMM"))
    ]);

    const events = flatten(eventsByMonth);

    for (const event of events) {
        const checksum = await hash(serialize(event));
        const where = {
            eventNumber: event.eventNumber,
            stringDate: event.stringDate
        };

        const existing = await db.event.findFirst({where});

        if (existing) {
            if (existing.checksum === checksum) continue;

            await db.event.deleteMany({
                where
            });
        }

        // todo: create in db
                

    }
}