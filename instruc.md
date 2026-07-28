# Cursor AI Prompt — Mamprobi Worship Center (MWC) Church Management System

## Project Overview

Build a **solo, admin-only full-stack Church Management System** for **Mamprobi Worship Center (MWC)**, a branch assembly under Pentecost International Worship Centre (PIWC). The system is used internally by authorized administrators only — there is no member-facing portal, no public signup, and no chat/video/audio features. Its purpose is to manage church member records: create, view, update, delete, export, and bulk-import members, with full logging of logins and data downloads.

Only seeded admin users can access the system. Multiple admins may work concurrently.

## Tech Stack

Use the following stack:

- **Framework:** Next.js 14 (App Router) with TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **ORM:** Prisma
- **Database:** PostgreSQL (Neon serverless)
- **Auth:** NextAuth.js v5 (Auth.js) — Credentials provider, seeded users only
- **Image storage:** Cloudinary (uploaded photos + live-captured photos)
- **Live camera capture:** Browser `getUserMedia` API (native, no extra service)
- **Spreadsheet import/export:** SheetJS (`xlsx`) for bulk upload and template download
- **Single-member export:** PDF via `@react-pdf/renderer` (or `pdf-lib`), plus optional Excel row export
- **Caching / rate-limiting (optional):** Upstash Redis
- **Validation:** Zod
- **Forms:** React Hook Form + Zod resolver
- **Deployment:** Vercel

**Do NOT include** LiveKit, Pusher, WebRTC, or any chat/text/video/audio functionality. Do not build member self-service profiles.

## Design & Theme

Derive the color palette from the church logos:

- **Primary:** Royal blue (`#2E3192` / deep indigo-blue, from the PIWC map + ring)
- **Accent:** Gold / yellow (`#FFDD00` / `#F9C440`, from the PIWC outer ring)
- **Neutrals:** Clean white backgrounds, near-black (`#111111`) text (echoing the MWC black-and-white branding)
- Use a modern, professional admin dashboard aesthetic: glassmorphism login screen, clean sidebar with clear active states, card-based layouts, generous whitespace.
- MWC logo (black-and-white) used in the sidebar/header; PIWC colored logo can appear on the login screen.
- Fully responsive across desktop, tablet, and mobile.

## Functional Requirements

**FR1 — Authentication**
- Admins log in with a seeded email and password (Credentials provider, NextAuth v5).
- Passwords hashed with bcrypt. No self-registration. Seed script creates initial admin(s).
- Protected routes: unauthenticated users are redirected to `/login`.

**FR2 — Member CRUD**
- Add a member, update member details, delete a member.
- Multiple admins can add/update/delete concurrently (see FR13).

**FR3 — Member fields (data model)**
Each member record stores:
- First name, Last name, Other names
- Sex (Male / Female)
- Assembly (English Assembly / Local Assembly) — enum
- Contact (phone)
- Passport-size photo (uploaded file OR live camera capture → Cloudinary)
- Location / residence
- Mother's full name
- Father's full name
- Position held in church
- Status (Member / Officer) — enum
- Date baptised
- Baptised by
- Timestamps (createdAt, updatedAt), and createdBy (which admin added the record)

**FR4 — Live photo capture**
- On the add/edit member form, admin can either upload a photo OR capture one live via webcam (`getUserMedia`). Captured image is converted to a blob/base64 and uploaded to Cloudinary.

**FR5 — Duplicate name detection**
- When the admin clicks "Add Member", the system checks for an existing member with the same full name (first + last + other names, case-insensitive). If a match exists, display a **warning message** (e.g. "A member named X already exists. Add anyway?") and let the admin confirm or cancel. This is a warning, not a hard block.

**FR6 — Single-member export**
- Admin can download/export an individual member's full details as a downloadable file (PDF recommended, with the member's photo and all fields).

**FR7 — Spreadsheet template download**
- Admin can download a spreadsheet (.xlsx) template pre-filled with the column headers matching all member fields (and any other tables), so it can be filled in and re-uploaded.

**FR8 — Bulk upload**
- Admin can upload a filled spreadsheet to bulk-create members. Parse with SheetJS, validate each row with Zod, report which rows succeeded/failed with reasons. Handle photo columns gracefully (e.g. optional URL or skip).

**FR9 — Member profile display**
- Dedicated page to view a single member's full profile (photo + all fields).

**FR10 — Member count**
- Dashboard displays the total number of members.

**FR11 — Assembly filter view**
- A section/page where the admin selects an assembly (English or Local). It lists all members in that assembly and shows the count for that assembly.

**FR12 — Users (admins) page**
- A dedicated page listing the users/admins of the system. Note: system users do NOT have self-service profile displays (per requirement — no user profile pages).

**FR13 — Audit logging**
- Log every login: which user, timestamp.
- Log every download/export: which user, which member(s), timestamp, and type (single export vs bulk).
- Provide a page to view these logs.

**FR14 — Concurrency**
- Multiple admins can add/delete/update simultaneously. Rely on PostgreSQL transactions and Prisma's optimistic handling; use unique constraints where appropriate and handle race conditions gracefully (e.g. return clear errors on constraint violations). Consider updatedAt-based optimistic concurrency checks on edits.

## Non-Functional Requirements

- **Security:** All routes and API endpoints require an authenticated admin session; server-side authorization on every mutation. Hashed passwords, secure sessions, protected uploads. Sensitive personal data handled carefully.
- **Performance:** Server-rendered pages, pagination on member lists, optimized Cloudinary image delivery, optional Redis caching for counts/lists.
- **Reliability:** Graceful error handling, transactional writes, clear user feedback (toasts).
- **Usability:** Clean, consistent, responsive UI; intuitive navigation; confirmation dialogs for destructive actions.
- **Maintainability:** TypeScript throughout, Prisma schema as single source of truth, modular component structure, Zod validation shared between client and server.
- **Scalability:** Serverless (Vercel + Neon + Upstash) scales with load.
- **Auditability:** Immutable audit logs for logins and downloads.

## Third-Party Services & Setup

### 1. Neon (PostgreSQL)
- Create a Neon project, get the pooled connection string.
- Env: `DATABASE_URL`, `DIRECT_URL` (for migrations).

### 2. Cloudinary (image storage)
- Create an account, get cloud name, API key, API secret.
- Create an unsigned upload preset (or use signed uploads via a server route — signed is more secure).
- Env: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

### 3. NextAuth.js v5 (Auth.js)
- Env: `AUTH_SECRET` (generate with `npx auth secret`), `NEXTAUTH_URL`.
- Credentials provider validating against seeded users in the DB.

### 4. Upstash Redis (optional caching/rate-limiting)
- Create a Redis database, get REST URL + token.
- Env: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.

### 5. Vercel (deployment)
- Connect the GitHub repo, add all env vars, deploy.

### `.env.example`
```
DATABASE_URL=
DIRECT_URL=
AUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## Prisma Schema (starting point)

```prisma
enum Sex {
  MALE
  FEMALE
}

enum Assembly {
  ENGLISH
  LOCAL
}

enum MemberStatus {
  MEMBER
  OFFICER
}

enum LogType {
  LOGIN
  EXPORT_SINGLE
  EXPORT_BULK
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String   // bcrypt hash
  createdAt DateTime @default(now())
  members   Member[] @relation("CreatedByUser")
  logs      AuditLog[]
}

model Member {
  id            String       @id @default(cuid())
  firstName     String
  lastName      String
  otherNames    String?
  sex           Sex
  assembly      Assembly
  contact       String?
  photoUrl      String?
  location      String?
  motherName    String?
  fatherName    String?
  position      String?
  status        MemberStatus @default(MEMBER)
  dateBaptised  DateTime?
  baptisedBy    String?
  createdById   String?
  createdBy     User?        @relation("CreatedByUser", fields: [createdById], references: [id])
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@index([assembly])
  @@index([lastName, firstName])
}

model AuditLog {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  type       LogType
  targetInfo String?  // e.g. member name/id, or "bulk: 40 records"
  createdAt  DateTime @default(now())

  @@index([type])
  @@index([createdAt])
}
```

## Recommended Project Structure

```
mwc-church-ms/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                 # seeds initial admin user(s)
├── public/
│   └── logos/                  # MWC + PIWC logos
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx       # sidebar + protected shell
│   │   │   ├── page.tsx         # dashboard: member count, quick stats
│   │   │   ├── members/
│   │   │   │   ├── page.tsx             # list + search + pagination
│   │   │   │   ├── new/page.tsx         # add member (with live capture)
│   │   │   │   ├── [id]/page.tsx        # member profile
│   │   │   │   └── [id]/edit/page.tsx   # edit member
│   │   │   ├── assemblies/page.tsx      # select English/Local + counts
│   │   │   ├── bulk/page.tsx            # template download + bulk upload
│   │   │   ├── users/page.tsx           # system users/admins list
│   │   │   └── logs/page.tsx            # audit logs
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── members/route.ts
│   │   │   ├── members/[id]/route.ts
│   │   │   ├── members/[id]/export/route.ts
│   │   │   ├── members/bulk/route.ts
│   │   │   ├── members/template/route.ts
│   │   │   ├── upload/route.ts          # signed Cloudinary upload
│   │   │   └── logs/route.ts
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                  # shadcn components
│   │   ├── members/
│   │   │   ├── MemberForm.tsx
│   │   │   ├── CameraCapture.tsx        # getUserMedia live capture
│   │   │   ├── PhotoUploader.tsx
│   │   │   ├── MembersTable.tsx
│   │   │   └── DuplicateWarningDialog.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   └── shared/
│   ├── lib/
│   │   ├── prisma.ts           # Prisma singleton
│   │   ├── auth.ts             # NextAuth config
│   │   ├── cloudinary.ts
│   │   ├── redis.ts            # optional
│   │   ├── xlsx.ts             # template + parse helpers
│   │   ├── pdf.ts              # single-member export
│   │   ├── audit.ts            # logging helper
│   │   └── validations/
│   │       └── member.ts       # Zod schemas
│   ├── types/
│   └── middleware.ts           # route protection
├── .env.example
├── package.json
└── README.md
```

## Build Order (do this step by step)

1. Scaffold Next.js 14 + TypeScript + Tailwind + shadcn/ui.
2. Set up Prisma + Neon; write schema; run first migration.
3. Write seed script for admin user(s); seed the DB.
4. Configure NextAuth v5 credentials auth + middleware route protection.
5. Build the glassmorphism login page (PIWC logo, blue/gold theme).
6. Build dashboard shell (sidebar with MWC logo, active states, header).
7. Build Member CRUD (form + validation + Cloudinary upload + live capture).
8. Implement duplicate-name warning dialog.
9. Build members list (search, pagination) and member profile page.
10. Build assemblies filter page with per-assembly counts.
11. Build spreadsheet template download + bulk upload (SheetJS + Zod row validation + results report).
12. Build single-member PDF export.
13. Implement audit logging (login + export) and the logs page.
14. Add member count to dashboard.
15. Build the users/admins page.
16. Polish UI, handle concurrency edge cases, add toasts and confirmation dialogs.
17. Prepare for Vercel deployment (env vars, build check).

Generate clean, production-ready TypeScript. Use server actions or route handlers consistently. Validate all input with Zod on the server. Handle errors gracefully with user-friendly messages.