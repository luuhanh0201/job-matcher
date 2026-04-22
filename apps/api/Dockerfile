FROM node:20-alpine

RUN corepack enable

WORKDIR /app

# Copy workspace config + all package.json files trước để cache layer install
COPY .npmrc pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/ui/package.json ./packages/ui/

RUN pnpm install --frozen-lockfile

COPY . .

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["pnpm", "start:dev"]