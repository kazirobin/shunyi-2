# Shunyi Garments Management System

A Next.js 15 App Router application for Shunyi Garments. The root URL is a public company landing page; management pages and APIs require an authenticated administrator session.

## Stack

- Next.js 15 / React 18 / TypeScript
- MongoDB Node.js driver (reused from the existing project)
- Signed HTTP-only admin session cookie
- Existing modular ERP pages and MongoDB/local-development JSON storage
- English and Simplified Chinese UI toggle; existing dark/light mode control

## Setup

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Set `MONGODB_URI` and `MONGODB_DATABASE`.
5. Set `ADMIN_EMAIL`.
6. Generate a password hash: `node scripts/hash-password.js "your-strong-password"` and put the output in `ADMIN_PASSWORD_HASH`.
7. Set `SESSION_SECRET` to a random value of at least 32 characters.
8. Run `npm run dev`.

Open `/` for the public company site and `/login` for administrator login. Successful login redirects to `/overview`. `/admin` also redirects to `/overview`. Logout returns to the public site.

## Routes

- `/` — Public landing page
- `/login` — Admin login
- `/overview` — Protected ERP dashboard
- `/employees` — Employee management
- `/attendance-management` — Attendance record management
- `/daily-attendance` — Daily attendance sheet
- `/<module>` — Other registered ERP modules, including Work Style and Products

All `/api/*` endpoints are protected except `/api/auth/login` and `/api/auth/logout`.

## Storage

MongoDB is required for production persistence. Local JSON fallback is intended for local development only. Do not deploy real credentials in source code. The project reads MongoDB and authentication secrets from environment variables.

## Security notes

- Never commit `.env.local` or production secrets.
- Use a unique, long admin password and a random `SESSION_SECRET`.
- The session cookie is HTTP-only, SameSite=Lax and Secure in production.
- Rotate the session secret to invalidate existing sessions.

## Build

Run `npm run build` before deployment. Configure all environment variables in the hosting provider (for example, Vercel) before building/deploying.
