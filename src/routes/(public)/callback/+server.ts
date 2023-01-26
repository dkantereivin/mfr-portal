import { google } from "googleapis";
import { error, json, redirect } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";
import { client } from "$lib/server/googleAuth";
import { db } from "$lib/server/db";
import { SESSION_COOKIE_ID, hardenedCookie, LOGIN_REDIRECT_TO } from "$lib/utils/cookies";
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

    if (!data.email) {
        throw error(400, "No email provided by Google.");
    }

    let user = await db.user.findFirst({
        where: {
            email: data.email!
        }
    });

    if (!user) {
        if (!refresh_token) {
            throw error(400, "No refresh token provided by Google.");
        }
        user = await db.user.create({
            data: {
                googleId: data.id!,
                email: data.email,
                firstName: data.given_name,
                lastName: data.family_name,
                refreshToken: refresh_token
            }
        });
    } else if (refresh_token) { // user exists but Google has sent a new refresh token
        await db.user.update({
            where: {
                id: user.id
            },
            data: {
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

    cookies.set(SESSION_COOKIE_ID, session.id, hardenedCookie());

    const redirectTo = cookies.get(LOGIN_REDIRECT_TO) ?? "/dashboard";
    cookies.delete(LOGIN_REDIRECT_TO, {path: '/'});
    throw redirect(302, redirectTo);
}