import { OAuth2Client } from "google-auth-library";
import { getSecret } from "./doppler";
import { PUBLIC_BASE_URL } from "$env/static/public";

const client = new OAuth2Client(
    await getSecret("GOOGLE_CLIENT_ID"),
    await getSecret("GOOGLE_CLIENT_SECRET"),
    PUBLIC_BASE_URL + "/callback"
)

export {
    client
}
