import mongoose from 'mongoose';

console.log('Connecting to MongoDB...');
const { DATABASE_URL } = await import('$env/static/private');
mongoose.set('strictQuery', true);
await mongoose.connect(DATABASE_URL)
    .then(() => console.log('Connected to MongoDB.'))
    .catch(err => {
        console.error('Could not connect to MongoDB.', err);
    });


export * from './user.model.server';
export * from './nfc.model.server';
export * from './attendance.model.server';
export * from './client';