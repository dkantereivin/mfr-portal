FROM node:18.15-alpine as builder

ARG DOPPLER_TOKEN_BUILD
ENV DOPPLER_TOKEN=${DOPPLER_TOKEN_BUILD}

WORKDIR /home/app

RUN apk add --no-cache python3 g++ make curl && \
  curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm
RUN apk add --no-cache --virtual cairo-dev-1.17.6-r3 pango-dev libjpeg-turbo-dev giflib-dev libpng-dev pixman xproto
RUN wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub && \
    echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' | tee -a /etc/apk/repositories && \
    apk add doppler

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN doppler run -- pnpm build

ENV PROTOCOL_HEADER="X-Forwarded-Proto"
ENV HOST_HEADER="X-Forwarded-Host"
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