import { google } from "googleapis";
import { error, json } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";
import { client } from "$lib/server/googleAuth";


export async function GET({url}: RequestEvent): Promise<Response> {
    const code = url.searchParams.get("code");

    if (url.searchParams.get("error") || !code) {
        throw error(400, `Error authenticating with Google.`)
    };
    
    const {tokens, res} = await client.getToken(code);
    client.setCredentials(tokens);
    
    const {access_token} = tokens;

    const oauth2 = google.oauth2({
        auth: client,
        version: "v2"
    });

    const {data} = await oauth2.userinfo.v2.me.get();

    

    return json(data);
}