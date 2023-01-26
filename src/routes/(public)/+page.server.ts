import { redirect } from "@sveltejs/kit";

export const load = ({ locals, url }) => {
    if (locals.authenticated) {
        throw redirect(307, '/dashboard');
    }
}