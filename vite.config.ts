import { sveltekit } from '@sveltejs/kit/vite';;
import type { UserConfig } from 'vite';

import { createRequire } from "module";

const prismaPlugin = () => {
	const require = createRequire(import.meta.url);
	const pathName = require
		.resolve("@prisma/client")
		.replace("@prisma/client/index.js", "");

	return {
		name: "prisma-vite-plugin",
		config: () => ({
			resolve: {
				alias: {
					".prisma/client/index-browser": `${pathName}.prisma/client/index-browser.js`
				}
			}
		})
	};
};

const config: UserConfig = {
	plugins: [sveltekit(), prismaPlugin()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
};

export default config;
