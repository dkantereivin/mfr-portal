import Redis from 'ioredis';
import { building } from '$app/environment';
import { env } from '$env/dynamic/private';

const fallbackUrl = process.env.NODE_ENV === 'production' ? 'redis://redis:6379' : 'redis://localhost:6379';
const url = 'redis://redis:6370' ?? env.REDIS_URL ?? fallbackUrl;
export const redis = new Redis(url, { lazyConnect: true });
if (!building) {
	await redis.connect();
	console.log('Connected to Redis.');
}

export const sessionKey = (id: string) => `sessions:${id}`;
