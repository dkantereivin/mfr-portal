import { dev } from '$app/environment';
import dayjs from 'dayjs';

interface CookieOptions {
    expires: Date;
    httpOnly: boolean;
    path: string;
    sameSite: 'strict' | 'lax' | 'none';
    secure: boolean;
  }

export function serializeCookie(
    name: string,
    value: string | Record<string, unknown>,
    {
        path = '/',
        expires = dayjs().add(12 * 7, 'hours').toDate(),
        sameSite = 'strict',
        httpOnly = false,
        secure = true
    }: Partial<CookieOptions>
): string {
    value = typeof value === 'string' ? value : JSON.stringify(value);
    const args = [
        `${name}=${encodeURIComponent(value)}`,
        `Path=${path}`,
        `Expires=${expires.toUTCString()}`,
        `SameSite=${sameSite}`
    ];
    if (httpOnly) {
        args.push('HttpOnly');
    }
    if (secure) {
        args.push('Secure');
    }
    return args.join('; ');
}

export function parseCookies(raw?: string): Record<string, string> {
    if (!raw) return {};
    const cookies = raw.split('; ');
    const result: Record<string, string> = {};
    for (const cookie of cookies) {
        const [key, value] = cookie.split('=');
        result[key] = decodeURIComponent(value);
    }
    return result;
}

export function setCookie(
    res: Response,
    name: string,
    value: string | Record<string, unknown>,
    options: Partial<CookieOptions> = {}
): void {
    res.headers.append('Set-Cookie', serializeCookie(name, value, options));
}

export function hardCookie(
    res: Response,
    name: string,
    value: string,
    options?: Partial<CookieOptions>
): void {
    setCookie(res, name, value, {
        path: '/',
        httpOnly: true,
        secure: true,
        expires: dayjs().add(12 * 7, 'hours').toDate(),
        ...options,
    });
}

export const standardCookie = () => ({
    path: '/',
    secure: !dev
})

export const hardenedCookie = () => ({
    path: '/',
    httpOnly: true,
    secure: !dev,
    expires: dayjs().add(7, 'days').toDate(),
});

export const SESSION_COOKIE_ID = "mfr_session";
export const LOGIN_REDIRECT_TO = "LOGIN_REDIRECT_TO"