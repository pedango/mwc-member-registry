# MWC Church Management System

Solo, admin-only full-stack Church Management System for **Mamprobi Worship Center (MWC)**, a branch assembly under Pentecost International Worship Centre (PIWC).

## Features

- Credentials-based admin authentication (NextAuth.js v5)
- Member CRUD with passport photo upload and live webcam capture
- Duplicate-name warning on create
- Member list with search + pagination
- Assembly filter views with counts
- Spreadsheet template download + bulk import (SheetJS + Zod)
- Single-member PDF / Excel export
- Audit logs for logins and exports
- System users listing

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn-style UI
- Prisma + PostgreSQL (Neon)
- NextAuth.js v5 (Credentials)
- Cloudinary (images)
- SheetJS (`xlsx`), `pdf-lib`
- Optional Upstash Redis caching

## Getting started

### 1. Install

```bash
npm install
```

### 2. Environment

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

Required:

- `DATABASE_URL` / `DIRECT_URL` — Neon Postgres
- `AUTH_SECRET` — generate with `npx auth secret`
- `NEXTAUTH_URL` — e.g. `http://localhost:3000`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`

Optional:

- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

### 3. Database

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

Seeded admins:

| Email | Password |
|---|---|
| `admin@mwc.org` | `Admin@123!` |
| `pastor@mwc.org` | `Admin@123!` |

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push the repo to GitHub.
2. Import the project in Vercel.
3. Add all environment variables from `.env.example`.
4. Set `NEXTAUTH_URL` to your production URL.
5. Deploy. Run migrations against Neon (`prisma migrate deploy`) before or during first deploy.

## Project structure

See `instruc.md` for the full recommended layout and functional requirements.
