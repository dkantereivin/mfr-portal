import { google } from "googleapis";
import {GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET} from "$env/static/private";
import { PUBLIC_BASE_URL } from "$env/static/public";

const createClient = () => new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    PUBLIC_BASE_URL + "/callback"
)

export {
    createClient
}
