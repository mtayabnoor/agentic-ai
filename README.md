# Next.js Boilerplate with Better Auth

Production-ready Next.js boilerplate with Better Auth already integrated.

It includes:

- Email/password authentication
- Email verification flow
- Forgot/reset password flow
- Route protection for authenticated pages
- Prisma + PostgreSQL setup
- Reusable UI components (shadcn-style)

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Better Auth
- Prisma 7
- PostgreSQL (Neon or standard Postgres)
- Tailwind CSS 4
- Vitest
- Resend (transactional emails)

## Project Structure

Important folders and files:

- `src/app/(auth)` - auth pages (`/signin`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email`)
- `src/app/(dashboard)` - protected app pages
- `src/app/api/auth/[...all]/route.ts` - Better Auth API handler
- `src/lib/auth.ts` - Better Auth server configuration
- `src/lib/auth-client.ts` - Better Auth client SDK setup
- `src/lib/email.ts` - Resend email functions
- `src/lib/db.ts` - Prisma client + database adapter selection
- `src/proxy.ts` - route protection and auth redirects
- `prisma/schema.prisma` - database schema

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/db_name

BETTER_AUTH_SECRET=replace-with-a-long-random-secret
BETTER_AUTH_URL=http://localhost:3000

RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=Your App <no-reply@yourdomain.com>
```

Notes:

- `BETTER_AUTH_URL` should match the app URL for your environment.
- `RESEND_FROM_EMAIL` must be a sender/domain verified in Resend.

### 3. Run database migrations

```bash
npx prisma migrate dev
```

### 4. Start development server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Authentication Behavior

- Sign up creates a user and sends a verification email.
- Users must verify their email before accessing dashboard routes.
- Sign in validates credentials via Better Auth.
- Forgot password sends reset email through Resend.
- Session handling is configured in Better Auth (`7 days` expiration, rolling updates).

## Route Protection

`src/proxy.ts` enforces:

- Unauthenticated users visiting `/dashboard/*` are redirected to `/signin`.
- Logged-in but unverified users are redirected to `/verify-email`.

## Scripts

- `npm run dev` - start local development server
- `npm run build` - build production bundle
- `npm run start` - start production server
- `npm run lint` - run ESLint
- `npm run test` - run tests in watch mode
- `npm run test:run` - run tests once
- `npm run format` - format project with Prettier

## Deployment

Deploy to Vercel or any Node-compatible platform.

For production:

- Set all required environment variables
- Use a production PostgreSQL database
- Set `BETTER_AUTH_URL` to your deployed URL
- Verify your Resend sender/domain for outgoing emails

## Why this boilerplate

This repo saves setup time by shipping a modern Next.js foundation where authentication is already wired end-to-end (backend, client, protected routing, and transactional emails).
