import mongoose from 'mongoose';
import {browser} from '$app/environment';

if (!browser) {
    console.log('Connecting to MongoDB...');
    const { DATABASE_URL } = await import('$env/static/private');
    mongoose.set('strictQuery', true);
    await mongoose.connect(DATABASE_URL)
        .then(() => console.log('Connected to MongoDB.'))
        .catch(err => {
            console.error('Could not connect to MongoDB.', err);
        });
}


// export all from ./
export * from './nfc.model';
export * from './user.model';
export * from './attendance.model';
