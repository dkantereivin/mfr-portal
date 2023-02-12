import { db } from "$lib/server/db";
import { requireRank } from "$lib/utils/auth";
import { LeadershipDepartment, Role } from "@prisma/client";
import { Actions, fail } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({locals, url}) => {
    requireRank(locals!.user, Role.CORPORAL, LeadershipDepartment.ADMINISTRATION);

    const userId = url.searchParams.get("id") ?? "";
        const activeUser = await db.user.findUnique({
            where: {
                id: userId
            }
        }) ?? {
            id: "",
            firstName: "",
            lastName: "",
            email: "",
            role: "NONE",
            dept: "NONE",
            contId: "",
            createdAt: new Date(),
            updatedAt: new Date(),
            googleId: ""
        };

    const users = await db.user.findMany({
        orderBy: {
            role: "asc"
        }
    });

    return {users, activeUser};
}) satisfies PageServerLoad;

export const actions = {
    editUser: async ({locals, request}) => {
        const form = await request.formData();
        const id = <string | null>form.get("id");
        if (!id) return fail(400, {message: "No User ID Provided."});

        const user = await db.user.findFirst({
            where: {id}
        });
        if (!user) return fail(400, {message: "User Not Found."});

        const toRank = <Role>form.get("rank");

        requireRank(locals!.user, Role.CORPORAL, LeadershipDepartment.ADMINISTRATION);
        requireRank(locals!.user, user.role);
        requireRank(locals!.user, toRank);

        await db.user.update({
            where: {id},
            data: {
                firstName: <string>form.get("firstName"),
                lastName: <string>form.get("lastName"),
                email: <string>form.get("email"),
                contId: <string>form.get("contId"),
                role: toRank,
                dept: <LeadershipDepartment>form.get("dept"),
            }
        });
    },
        
    deleteUser: async ({locals, request}) => {
        const form = await request.formData();
        const id = <string | null>form.get("id");
        if (!id) return fail(400, {message: "No User ID Provided."});

        const user = await db.user.findFirst({
            where: {id}
        });
        if (!user) return fail(400, {message: "User Not Found."});

        requireRank(locals!.user, Role.CORPORAL, LeadershipDepartment.ADMINISTRATION);
        requireRank(locals!.user, user.role);

        await db.user.delete({
            where: {id}
        });

        return 'OK';
    }
} satisfies Actions;