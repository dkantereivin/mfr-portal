import { error, redirect } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";
import { client } from "$lib/server/googleAuth";
import { SESSION_COOKIE_ID, hardenedCookie, LOGIN_REDIRECT_TO } from "$lib/utils/cookies";
import {MasterSheet} from '$lib/server/sheets/master';
import { User } from "$lib/models/server";
import { randomString } from "$lib/utils/misc";
import { redis, sessionKey } from "$lib/server/redis";

export async function GET({url, cookies}: RequestEvent): Promise<Response> {
    const code = url.searchParams.get("code");

    if (url.searchParams.get("error") || !code) {
        throw error(400, "Error authenticating with Google.");
    }

    const {tokens} = await client.getToken(code);
    client.setCredentials(tokens);

    const res = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`);
    const data = await res.json();
    
    const {refresh_token: refreshToken} = tokens;

    if (!data.email) {
        throw error(400, "No email provided by Google.");
    }

    let user = await User.findOne({email: data.email});

    if (user && refreshToken) {
        user.google = {id: data.id, refreshToken};
        await user.save();
    } else if (!user) {
        user = new User();
        user.email = data.email;
        
        // populate with data from SJA Master Sheet if available
        const info = await MasterSheet.getUserData(data.email);
        if (info) {
            user.firstName = info.firstName;
            user.lastName = info.lastName;
            user.contId = info.contId;
            user.role = info.role;
            user.dept = info.dept;
        } else {
            user.firstName = data.given_name;
            user.lastName = data.family_name;
        }

        // optionally add refresh token, don't throw if not
        if (refreshToken) {
            user.google = {id: data.id, refreshToken};
        }

        await user.save();
    }

    const sessionId = randomString(32);
    const TTL = 60 * 60 * 24 * 14; // 14 days (in seconds)

    await redis.set(sessionKey(sessionId), JSON.stringify(user.toJSON()), "EX", TTL);
    cookies.set(SESSION_COOKIE_ID, sessionId, hardenedCookie());

    const redirectTo = cookies.get(LOGIN_REDIRECT_TO) ?? "/dashboard";
    cookies.delete(LOGIN_REDIRECT_TO, {path: '/'});
    throw redirect(302, redirectTo);
}
