import { google } from "googleapis";
import { env } from "$env/dynamic/private";

const CLIENT_ID = env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;

const client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    "http://localhost:5173/callback"
)

export {
    client,
    CLIENT_ID,
    CLIENT_SECRET
}