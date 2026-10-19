# Base stage with Node 24 and pnpm
FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY pnpm-lock.yaml* pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
COPY apps/worker/package.json ./apps/worker/
COPY apps/web/package.json ./apps/web/

RUN pnpm install

# Builder stage
FROM dependencies AS builder
COPY . .
RUN pnpm --filter @study-search/shared build
RUN pnpm --filter @study-search/api build
RUN pnpm --filter @study-search/worker build
RUN pnpm --filter @study-search/web build

# API Runner (non-root)
FROM node:24-alpine AS api-runner
RUN apk add --no-cache curl wget
WORKDIR /app
ENV NODE_ENV=production

# Security: run as non-root user
USER node

COPY --chown=node:node --from=builder /app/package.json /app/pnpm-workspace.yaml ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/packages/shared ./packages/shared
COPY --chown=node:node --from=builder /app/apps/api ./apps/api

EXPOSE 4000
CMD ["node", "apps/api/dist/server.js"]

# Worker Runner (non-root)
FROM node:24-alpine AS worker-runner
RUN apk add --no-cache curl wget
WORKDIR /app
ENV NODE_ENV=production

USER node

COPY --chown=node:node --from=builder /app/package.json /app/pnpm-workspace.yaml ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/packages/shared ./packages/shared
COPY --chown=node:node --from=builder /app/apps/worker ./apps/worker

CMD ["node", "apps/worker/dist/index.js"]
