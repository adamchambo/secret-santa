# Secret Santa

## Features

## Tech Stack

- Next.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- WebSockets
- Tailwind CSS
- pnpm

## Installation

```bash
git clone <repo>
cd <repo>

cd db
pnpm install
pnpm exec prisma generate

cd ../api
pnpm install
pnpm run dev

cd ../web
pnpm install
pnpm dev
```

## Production

The project uses Node `24`, GitHub Actions, PM2, and an Ubuntu VPS.

API production runtime:

```bash
cd api
pnpm run build
pnpm start
```

Under the hood, `pnpm run build` compiles TypeScript into `api/dist/`, and `pnpm start` runs:

```bash
node dist/server.js
```

Web production runtime:

```bash
cd web
pnpm run build
pnpm start
```

## Deployment

Deploys run from the `master` branch to:

```text
~/apps/secret-santa
```

GitHub Actions deploys over SSH, then runs:

```bash
git fetch origin master
git checkout master
git pull --ff-only origin master

cd db
pnpm install --frozen-lockfile
pnpm exec prisma generate
pnpm exec prisma migrate deploy

cd ../api
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit
pnpm run build

cd ../web
pnpm install --frozen-lockfile
pnpm run build

pm2 restart secret-santa-api || true
pm2 restart secret-santa-web || true
```
