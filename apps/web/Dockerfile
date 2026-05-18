FROM node:20-alpine

RUN corepack enable

WORKDIR /app

COPY .npmrc pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/ui/package.json ./packages/ui/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter web build

ENV NODE_ENV=production

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["pnpm", "start"]
