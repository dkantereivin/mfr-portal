import type { IUser } from '$lib/models/models.client';

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
