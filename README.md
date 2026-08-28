# UniSmart

A university management system built with Next.js (App Router), a self-built
credentials-based auth system, and Drizzle ORM on Neon Postgres. It provides
ten role-scoped portals — student, lecturer, department, faculty, registrar,
finance, accommodation, library, graduation scanner, and admin — plus an
end-to-end graduation flow (clearance tracking, visitor registration, QR pass
generation, and gate scanning).

## Tech stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Auth:** Custom credentials auth — passwords hashed with Node's `scrypt`,
  database-backed sessions in an httpOnly cookie. No third-party auth provider.
- **Database:** [Neon](https://neon.tech) Postgres via [Drizzle ORM](https://orm.drizzle.team)
- **UI:** Tailwind CSS + shadcn/ui (Radix primitives)
- **QR codes:** `qrcode` for generation, `html5-qrcode` for scanning

## Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) Postgres database (or any Postgres instance)

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Create `.env.local` in the project root:

   ```bash
   # Database (Neon connection string)
   DATABASE_URL=postgresql://...

   # Secret used to sign short-lived account-activation tokens.
   # Generate with: openssl rand -base64 32
   AUTH_SECRET=...
   ```

3. **Push the schema and seed reference + demo data**

   ```bash
   npm run db:push
   npm run db:seed
   ```

   Seeding creates baseline faculties, departments, programs, courses, rooms,
   books, and a graduation ceremony, plus:

   - A **pre-provisioned student and lecturer roster** (`student_registry` /
     `lecturer_registry`) that demo accounts can self-activate against.
   - Directly-created **staff/admin accounts** (registrar, finance, library,
     etc.) since those roles have no self-service activation.

   The seed script prints the demo credentials it created, including the
   shared demo password.

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Authentication model

Real universities don't let students self-register with an arbitrary email —
they pre-load an official roster and require students/lecturers to *prove*
they belong to it before creating a login. This app follows that pattern:

**Students & lecturers — activate, then log in**

1. The registrar/HR pre-loads official records into `student_registry` /
   `lecturer_registry` (registration or staff number, national ID, university
   email, name, program/department). No login exists yet.
2. The person visits **`/activate`**, picks Student or Lecturer, and enters
   their registration/staff number + national ID + university email.
3. On a match, they set their own password. This creates their `users` row
   (with a hashed password) and links their `students`/`lecturers` record.
4. From then on they sign in at **`/sign-in`** with:
   - **Student:** Registration Number + Password
   - **Lecturer:** Staff Number (or university email) + Password

**Admins & other staff (department, faculty, registrar, finance,
accommodation, library, graduation staff, executive) — no self-service
activation.** Their accounts are created directly (by an administrator, or via
the seed script for the demo). They sign in at `/sign-in` with **University
Email + Password**.

The registration/staff number is never used as the password — activation
always ends with the person choosing their own.

Sessions are opaque random tokens stored in the `sessions` table and set as an
httpOnly, `SameSite=Lax` cookie; there's no third-party auth dependency.

## Scripts

| Command           | Description                                   |
| ------------------ | ---------------------------------------------- |
| `npm run dev`       | Start the dev server (Turbopack)               |
| `npm run build`     | Production build                               |
| `npm run start`     | Start the production server                    |
| `npm run lint`      | Run ESLint                                     |
| `npm run db:push`   | Push the Drizzle schema to the database        |
| `npm run db:seed`   | Seed baseline reference + demo data            |

## Authorization model

Auth is enforced per-resource rather than solely by a route matcher: every
portal layout calls `requirePortal(slug)`, and every server action re-checks
the caller's role before mutating data (e.g. only `registrar` can approve
graduation applications; only `finance` can record payments).

## Deployment

This project is set up to deploy on [Vercel](https://vercel.com). Set the same
environment variables from `.env.local` in your Vercel project settings, then:

```bash
vercel deploy --prod
```
