# --- STAGE 1: BUILD ---
FROM node:22-alpine AS builder

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.11.1 --activate && \
    apk add --no-cache libc6-compat openssl

# Copy package files (cache layer)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/database/package.json ./packages/database/
COPY apps/bot/package.json ./apps/bot/
COPY packages/database/prisma ./packages/database/prisma

# Install deps and generate prisma (single layer for caching)
RUN pnpm install --frozen-lockfile --ignore-scripts && \
    pnpm --filter @repo/database exec prisma generate

# Copy source and build
COPY packages/database ./packages/database
COPY apps/bot ./apps/bot
COPY tsconfig.json ./
RUN pnpm -F khaxyrewrite... run build

# --- STAGE 2: PROD DEPS (using npm for flat node_modules) ---
FROM node:22-alpine AS deps

WORKDIR /app
RUN apk add --no-cache openssl

# Create standalone package.json and install deps in one layer
COPY apps/bot/package.json ./
COPY packages/database/prisma ./prisma
RUN npm pkg delete scripts && \
    npm pkg delete dependencies.@repo/database && \
    npm install --omit=dev --ignore-scripts && \
    npm install @prisma/client@6.19.0 --ignore-scripts && \
    npx prisma@6.19.0 generate

# --- STAGE 3: MINIMAL RUNNER ---
FROM node:22-alpine AS runner

RUN apk add --no-cache openssl
WORKDIR /app

# Copy everything needed
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/apps/bot/dist ./dist
COPY --from=builder /app/apps/bot/locales ./locales
COPY --from=builder /app/apps/bot/config.toml ./config.toml
COPY --from=builder /app/packages/database/dist ./node_modules/@repo/database/dist
COPY --from=builder /app/packages/database/package.json ./node_modules/@repo/database/

# Copy prisma schema for migrations
COPY --from=deps /app/prisma ./prisma

ENV NODE_ENV=production

# Run migrations then start bot
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy --schema=./prisma/schema.prisma && node --enable-source-maps dist/index.js"]
