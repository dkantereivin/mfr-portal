import type { PageServerLoad } from "../$types";
import dayjs, { Dayjs } from "dayjs";
import {error} from "@sveltejs/kit"
import {db} from "$lib/server/db";

export const load = (async ({params}) => {
    const raw = params.date;
    let date: Dayjs;
    if (!raw || raw === "today" || raw === "") {
        date = dayjs();
    } else {
        date = dayjs(raw, "YYYY-MM-DD");
    }

    if (!date.isValid()) {
        return error(404, "Invalid date");
    }

    console.log(date);

    const attendance = await db.attendance.findMany({
        where: {
            time: {
                gte: date.startOf("day").toDate(),
                lt: date.endOf("day").toDate()
            }
        },
        include: {
            user: true
        }
    });

    return {attendance, date: date.format("YYYY-MM-DD")}

}) satisfies PageServerLoad;