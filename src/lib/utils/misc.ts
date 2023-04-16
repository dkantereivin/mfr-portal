const dec2hex = (dec: number): string => dec.toString(16).padStart(2, '0');

export const randomString = (length: number): string => {
	const arr = new Uint8Array(length / 2);
	crypto.getRandomValues(arr);
	return Array.from(arr, dec2hex).join('');
};

export const sha256 = (str: string): Promise<string> => {
	const buffer = new TextEncoder().encode(str);
	return crypto.subtle.digest('SHA-256', buffer).then((hash) => {
		return Array.from(new Uint8Array(hash), dec2hex).join('');
	});
}