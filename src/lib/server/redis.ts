import Redis from 'ioredis';
import { building } from '$app/environment';
import { fetchSecret } from './doppler';

const url = await fetchSecret('REDIS_URL') ?? 'redis://localhost:6379';
export const redis = new Redis(url, {lazyConnect: true});
if (!building) {
    await redis.connect();
    console.log('Connected to Redis.')
}

export const sessionKey = (id: string) => `sessions:${id}`;