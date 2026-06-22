# Build stage
FROM node:25-alpine AS build

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
    cmake -DCMAKE_POLICY_VERSION_MINIMUM=3.5 .. && \
    make && \
    make install

RUN apk del build-base cmake git

WORKDIR /build

COPY . .

RUN npm install

RUN npm run build

FROM node:25-alpine AS production

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