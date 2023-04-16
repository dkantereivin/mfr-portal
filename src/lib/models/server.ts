import mongoose from 'mongoose';
import { building } from '$app/environment';
import { env } from '$env/dynamic/private';

mongoose.set('strictQuery', true);
if (!building) {
	console.log('Connecting to MongoDB...');
	const DATABASE_URL = env.DATABASE_URL;
	console.log(DATABASE_URL);
	if (!DATABASE_URL) {
		throw new Error('Unable to fetch DATABASE_URL from Doppler.');
	}

	await mongoose
		.connect(DATABASE_URL)
		.then(() => console.log('Connected to MongoDB.'))
		.catch((err) => {
			console.error('Could not connect to MongoDB.', err);
		});
}

export * from './user.model.server';
export * from './nfc.model.server';
export * from './attendance.model.server';
export * from './event.model.server';
export * from './client';