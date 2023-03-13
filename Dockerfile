FROM node:lts-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./