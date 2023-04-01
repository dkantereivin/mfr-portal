FROM node:18.15-alpine as builder

ARG ORIGIN
ARG DOPPLER_TOKEN
ARG ENVIRONMENT=staging

WORKDIR /home/app

RUN echo 'http://dl-4.alpinelinux.org/alpine/v3.15/main' >> /etc/apk/repositories
RUN apk add --no-cache python3 g++ make curl && \
  curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm
RUN apk add --no-cache --virtual cairo-dev-1.17.6-r3 pango-dev libjpeg-turbo-dev giflib-dev libpng-dev pixman xproto

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN PUBLIC_BASE_URL=${ORIGIN} DOPPLER_TOKEN=${DOPPLER_TOKEN} NODE_ENV=${ENVIRONMENT} pnpm build

CMD ["pnpm", "start"]

# partially optimized production stage
# FROM node:18.15-alpine as prod
# RUN apk add --no-cache python3 g++ make curl && \
#   curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

# WORKDIR /home/app

# COPY --from=builder /home/app/package.json /home/app/pnpm-lock.yaml ./
# RUN pnpm install --frozen-lockfile --prod
# COPY --from=builder /home/app/build ./build

# CMD ["pnpm", "start"]