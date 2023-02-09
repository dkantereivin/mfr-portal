import { google } from "googleapis";
import { env } from "$env/dynamic/private";

const createClient = () => new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.PUBLIC_BASE_URL + "/callback"
)

export {
    createClient
}
