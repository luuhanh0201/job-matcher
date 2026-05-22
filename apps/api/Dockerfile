# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN corepack enable
WORKDIR /app

# Copy workspace configuration
COPY .npmrc pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/ui/package.json ./packages/ui/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
RUN corepack enable
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN pnpm --filter api build

# Stage 3: Runner
FROM node:20-alpine AS runner
RUN corepack enable
WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/

# Copy workspace files for pnpm
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./


# Install only production dependencies
ENV NODE_ENV=production
RUN pnpm install --prod --frozen-lockfile

USER nestjs

WORKDIR /app/apps/api

EXPOSE 3001

ENV PORT=3001

CMD ["node", "dist/src/main.js"]