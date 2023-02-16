/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./src/**/*.{html,svelte,js,ts}',
		'./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'
	],
	theme: {
		extend: {
			fontFamily: {
				segoe: [
					'"Segoe UI"',
					'ui-sans-serif',
					'system-ui',
					'-apple-system',
					'Roboto',
					'"Helvetica Neue"'
				]
			}
		}
	},
	plugins: [require('flowbite/plugin')]
};
