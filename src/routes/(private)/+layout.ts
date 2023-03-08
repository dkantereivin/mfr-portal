import type { Config } from "@sveltejs/adapter-vercel"
export const config: Config = {
    split: true,
    runtime: 'nodejs18.x'
}