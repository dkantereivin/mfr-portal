import { google } from "googleapis";
import { error, json, redirect } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";
import { client } from "$lib/server/googleAuth";
import { db } from "$lib/server/db";
import { HARDENED_COOKIE } from "$lib/utils/cookies";
import dayjs from "dayjs";


export async function GET({url, cookies}: RequestEvent): Promise<Response> {
    const code = url.searchParams.get("code");

    if (url.searchParams.get("error") || !code) {
        throw error(400, "Error authenticating with Google.");
    };

    const {tokens} = await client.getToken(code);
    client.setCredentials(tokens);

    const oauth2 = google.oauth2({
        auth: client,
        version: "v2"
    });

    const {data} = await oauth2.userinfo.v2.me.get();
    const {refresh_token} = tokens;

    if (!refresh_token) {
        throw error(400, "No refresh token provided by Google.");
    }
    if (!data.email) {
        throw error(400, "No email provided by Google.");
    }

    let user = await db.user.findFirst({
        where: {
            email: data.email!
        }
    });

    if (!user) {
        user = await db.user.create({
            data: {
                googleId: data.id!,
                email: data.email,
                firstName: data.given_name,
                lastName: data.family_name,
                refreshToken: refresh_token
            }
        });
    }

    // create session
    const TTL = dayjs().add(12 * 7, "hours").toDate();
    const session = await db.session.create({
        data: {
            userId: user.id,
            expiresAt: TTL
        }
    });

    cookies.set("session", session.id, HARDENED_COOKIE);
    throw redirect(302, "/");
}