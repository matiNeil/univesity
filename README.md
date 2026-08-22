# Gopito University Portal

A university management system built with Next.js (App Router), Clerk auth, and
Drizzle ORM on Neon Postgres. It provides ten role-scoped portals — student,
lecturer, department, faculty, registrar, finance, accommodation, library,
graduation scanner, and admin — plus an end-to-end graduation flow (clearance
tracking, visitor registration, QR pass generation, and gate scanning).

## Tech stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Auth:** [Clerk](https://clerk.com) — role is stored in `publicMetadata` and mirrored into the database
- **Database:** [Neon](https://neon.tech) Postgres via [Drizzle ORM](https://orm.drizzle.team)
- **UI:** Tailwind CSS + shadcn/ui (Radix primitives)
- **QR codes:** `qrcode` for generation, `html5-qrcode` for scanning

## Prerequisites

- Node.js 20+
- A [Clerk](https://clerk.com) application (for auth)
- A [Neon](https://neon.tech) Postgres database (or any Postgres instance)

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Create `.env.local` in the project root:

   ```bash
   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/portal
   NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/onboarding

   # Database (Neon connection string)
   DATABASE_URL=postgresql://...
   ```

3. **Push the schema and seed reference data**

   ```bash
   npm run db:push
   npm run db:seed
   ```

   Seeding creates baseline faculties, departments, programs, courses, rooms,
   books, and a graduation ceremony. Students, lecturers, and other role
   records are created on demand when a user completes onboarding.

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Sign up, then pick a
   role on the onboarding screen to reach the matching portal.

   > The onboarding role picker is a self-service stand-in for demo purposes —
   > in a real deployment, role assignment would be done by the registrar/HR,
   > not the user themselves.

## Scripts

| Command           | Description                                   |
| ------------------ | ---------------------------------------------- |
| `npm run dev`       | Start the dev server (Turbopack)               |
| `npm run build`     | Production build                               |
| `npm run start`     | Start the production server                    |
| `npm run lint`      | Run ESLint                                     |
| `npm run db:push`   | Push the Drizzle schema to the database        |
| `npm run db:seed`   | Seed baseline reference data                   |

## Authorization model

Auth is enforced per-resource rather than solely by middleware: every portal
layout calls `requirePortal(slug)`, and every server action re-checks the
caller's role before mutating data (e.g. only `registrar` can approve
graduation applications; only `finance` can record payments). `src/proxy.ts`
only establishes the Clerk request context — it does not gate routes by path.

## Deployment

This project is set up to deploy on [Vercel](https://vercel.com). Set the same
environment variables from `.env.local` in your Vercel project settings, then:

```bash
vercel deploy --prod
```
