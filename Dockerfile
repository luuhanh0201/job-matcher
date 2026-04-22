FROM node:20-alpine

RUN corepack enable
WORKDIR /app

# copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# copy package.json của từng app
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json

RUN pnpm install

COPY . .

CMD ["pnpm", "--filter", "web", "dev"]