import {User} from '@prisma/client';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			authenticated?: boolean;
			user?: User;
		}
		interface PageData {}
		// interface Platform {}
	}
}
