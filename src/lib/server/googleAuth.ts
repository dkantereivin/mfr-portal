import { google } from "googleapis";
import { env } from "$env/dynamic/private";

const createClient = () => new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    "http://localhost:5173/callback"
)

export {
    createClient
}
