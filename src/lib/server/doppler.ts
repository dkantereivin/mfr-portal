import { NODE_ENV, DOPPLER_TOKEN } from '$env/dynamic/private'

export const BASE_URL = 'https://api.doppler.com/v3';
const PROJECT_NAME = 'mfr-portal';

const TTL = 30 * 60 * 1000; // 30 minutes
let lastUpdated: number | null = null; // see last line of file where updateSecretCache() is called.
const cache = new Map<string, string>();

type SecretObject = {
    raw: string;
    computed: string;
    note: string;
};

const headers = {
    accept: 'application/json',
    authorization: `Bearer ${DOPPLER_TOKEN}`,
};

const defaultOptions = {
    method: 'GET',
    headers
};

export const fetchSecret = async (name: string) => {
    const params = new URLSearchParams({
        project: PROJECT_NAME,
        config: NODE_ENV,
        name
    });

    const url = `${BASE_URL}/configs/config/secret?${params}`;

    const res = await fetch(url, defaultOptions);
    const {value} = await res.json();

    return value.computed;
};

export const fetchSecrets = async () => {
    const params = new URLSearchParams({
        project: PROJECT_NAME,
        config: NODE_ENV,
    });
    const url = `${BASE_URL}/configs/config?${params}`;

    const res = await fetch(url, defaultOptions);
    const json = await res.json();

    const secrets: Record<string, SecretObject> = json.secrets;
    const variables: Record<string, string> = {};
    Object.keys(secrets).forEach((key) => variables[key] = secrets[key].computed);
    
    return variables;
}

export const updateSecretCache = async () => {
    const secrets = await fetchSecrets();
    cache.clear(); // allows token deletion on Doppler to delete from memory (for security)
    Object.keys(secrets).forEach((key) => cache.set(key, secrets[key]));
    lastUpdated = Date.now();
}

/*
Use a cached version of the secrets as long as TTL has not expired,
otherwise update the cache from Doppler.
*/
export const getSecret = async (name: string) => {
    if (lastUpdated && Date.now() - lastUpdated < TTL) {
        return cache.get(name);
    }

    await updateSecretCache();
    return cache.get(name);
}

await updateSecretCache();