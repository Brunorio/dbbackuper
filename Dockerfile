# Build stage
FROM node:20-alpine3.19@sha256:ef3f47741e161900ddd07addcaca7e76534a9205e4cd73b2ed091ba339004a75 AS build

RUN apk update && \
    apk add --no-cache \
    build-base \
    cmake \
    git \
    mariadb-dev \
    glib-dev \
    zlib-dev \
    pcre2-dev

RUN git clone https://github.com/mydumper/mydumper.git && \
    cd mydumper && \
    mkdir build && \
    cd build && \
    cmake .. && \
    make && \
    make install

RUN apk del build-base cmake git

WORKDIR /build

COPY . .

RUN npm install

RUN npm run build

FROM node:20-alpine3.19@sha256:ef3f47741e161900ddd07addcaca7e76534a9205e4cd73b2ed091ba339004a75 as production

COPY --from=build /usr/local/bin/mydumper /usr/local/bin/
COPY --from=build /usr/local/bin/myloader /usr/local/bin/

RUN apk update && \
    apk add --no-cache \
    mariadb-connector-c \
    glib \
    zlib \
    pcre2

WORKDIR /app

COPY --from=build /build/package.json package.json

COPY --from=build /build/node_modules node_modules

COPY --from=build /build/dist dist

COPY .env /app/.env

COPY tasks.json /app/tasks.json

CMD ["npm", "run", "start:production"]