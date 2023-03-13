import type { IUser } from '$lib/models/user.model';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			authenticated?: boolean;
			user: IUser;
		}
		interface PageData {}
		// interface Platform {}
	}
}
