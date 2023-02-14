import type { PageServerLoad } from "./$types";
import dayjs, { Dayjs } from "dayjs";
import {error} from "@sveltejs/kit"
import {db} from "$lib/server/db";
import { requireRank } from "$lib/utils/auth";
import {Role, LeadershipDepartment} from "@prisma/client";
import { localTime, parseDate } from "$lib/utils/dates";

export const load = (async ({params, locals}) => {
    requireRank(
        locals.user!, Role.CORPORAL,
        [LeadershipDepartment.ADMINISTRATION, LeadershipDepartment.TRAINING]
    );

    const raw = params.date;
    let date: Dayjs;
    if (!raw || raw === "today" || raw === "") {
        date = localTime();
    } else {
        date = parseDate(raw);
    }

    if (!date.isValid()) {
        return error(404, "Invalid date");
    }

    const attendance = await db.attendance.findMany({
        where: {
            time: {
                gte: date.startOf("day").utc().toDate(),
                lt: date.endOf("day").utc().toDate()
            }
        },
        include: {
            user: true
        }
    });

    return {attendance, date: date.format("YYYY-MM-DD")}

}) satisfies PageServerLoad;
