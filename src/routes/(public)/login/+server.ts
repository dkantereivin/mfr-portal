import { redirect } from "@sveltejs/kit";
import { createClient } from "$lib/server/googleAuth";

const scope = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
];

export function GET(): Response {
    const client = createClient();
    const url = client.generateAuthUrl({
        access_type: "offline",
        scope,
        include_granted_scopes: true
    });

    throw redirect(302, url);
}
