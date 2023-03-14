import Redis from 'ioredis';
import { fetchSecret } from './doppler';

const url = await fetchSecret('REDIS_URL') ?? 'redis://localhost:6379';
export const redis = new Redis(url);
redis.on('connect', () => console.log('Connected to Redis.'));

export const sessionKey = (id: string) => `sessions:${id}`;