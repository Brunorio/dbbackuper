# ==========================================
# 1. BUILD STAGE (Debian Slim Base)
# ==========================================
FROM node:25-slim AS build

# Added ca-certificates so git clone can verify SSL connections
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    git \
    ca-certificates \
    default-libmysqlclient-dev \
    libglib2.0-dev \
    zlib1g-dev \
    libpcre3-dev \
    && rm -rf /var/lib/apt/lists/*

# Clone exactly v0.10.5 as requested
RUN git clone --branch v0.10.5 --depth 1 https://github.com/mydumper/mydumper.git && \
    cd mydumper && \
    mkdir build && cd build && \
    cmake -DCMAKE_POLICY_VERSION_MINIMUM=3.5 \
          -DCMAKE_C_FLAGS="-w -Wno-implicit-function-declaration" \
          -DWITH_SSL=OFF .. && \
    make && \
    make install

WORKDIR /build

COPY . .

RUN npm install

RUN npm run build

# ==========================================
# 2. PRODUCTION STAGE (Debian Slim Base)
# ==========================================
FROM node:25-slim AS production

# Copy compiled v0.10.5 binaries from the build stage
COPY --from=build /usr/local/bin/mydumper /usr/local/bin/
COPY --from=build /usr/local/bin/myloader /usr/local/bin/

# Install matching native client runtime dependencies 
RUN apt-get update && apt-get install -y --no-install-recommends \
    default-mysql-client \
    libglib2.0-0 \
    zlib1g \
    libpcre3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy application layers
COPY --from=build /build/package.json package.json
COPY --from=build /build/node_modules node_modules
COPY --from=build /build/dist dist
COPY .env /app/.env
COPY tasks.json /app/tasks.json

CMD ["npm", "run", "start:production"]
