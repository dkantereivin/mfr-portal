import Redis from 'ioredis';
import {REDIS_URL} from '$env/dynamic/private';

const url = REDIS_URL ?? 'redis://localhost:6379';
export const redis = new Redis(REDIS_URL);

export const sessionKey = (id: string) => `sessions:${id}`;