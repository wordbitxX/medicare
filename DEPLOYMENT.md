# Medicare Plus — Vercel + Supabase deployment

## Production architecture

For Vercel, use:

**Vercel Serverless → Supabase Transaction Pooler → PostgreSQL**

Use the **Transaction Pooler / port 6543** connection string, not the Session Pooler / port 5432 string.

This is important because Vercel can run many serverless instances. The Transaction Pooler multiplexes application connections so traffic spikes do not consume the database's session-client limit.

## 1. Supabase setup

Open Supabase → **Connect** → connection string → **Transaction Pooler**.

Copy the PostgreSQL URL using port **6543**.

Do not paste the real URL into source code or GitHub. It contains database credentials.

## 2. Vercel environment variables

In Vercel → Project → Settings → Environment Variables:

- `DATABASE_URL` = your Supabase **Transaction Pooler** URL (port 6543)
- `NEXT_PUBLIC_SITE_URL` = your real website URL
- `SEED_DEMO_DATA=false` for a real/clean production database
- or leave `SEED_DEMO_DATA` unset if you want the demo seeding flow available

Redeploy after changing environment variables.

## 3. Create the database schema ONCE

The production app deliberately does **not** run migrations during every Vercel cold start.

That is intentional. Running `CREATE TABLE` / indexes / seed logic from `instrumentation.ts` is unsafe at scale because every new serverless instance can attempt database work simultaneously.

Preferred method:

1. Supabase → SQL Editor.
2. Open the project's `supabase/schema.sql`.
3. Run it once.
4. Confirm the tables exist.

The repository also contains `src/db/migrate.ts` for the existing admin setup flow, but Supabase SQL Editor is the recommended production migration path.

## 4. Seed demo data

After the schema exists, use the existing admin seed flow if this is a demo database.

The app's `/api/admin/seed` endpoint can create/verify the schema and seed demo records. Do this once, not on every request.

After seeding, check:

`/api/health`

A healthy result starts with:

```json
{"ok":true,"database":"connected"}
```

## 5. Why this fixes EMAXCONNSESSION

The previous build used:

- Supabase Session Pooler
- port 5432
- a local `pg.Pool` with `max: 10`
- automatic database bootstrap from `instrumentation.ts`

On Vercel, several serverless instances could therefore create pools at the same time. The Supabase Session Pooler then reported:

`EMAXCONNSESSION max clients reached in session mode`

The new build:

- prefers Supabase Transaction Pooler (6543)
- limits each Node/Vercel instance to only 2 database connections
- reuses the pool during warm invocations
- closes idle connections quickly
- does NOT run schema migrations on every cold start
- does NOT seed demo data from normal public requests
- keeps `/api/health` lightweight

## 6. Hostinger

Hostinger can also use the same database.

For Hostinger, a persistent Node process can use either a suitable Supabase connection string, but keeping the Transaction Pooler URL is also fine for this application.

Set:

- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `SEED_DEMO_DATA` as appropriate

Then restart the Node application.

## 7. Important production note

No application can honestly guarantee "never an error" under unlimited worldwide traffic. The correct scalable design is to prevent the known failure mode and keep database connections bounded.

For a larger real-world launch, also enable:

- Vercel's appropriate plan/concurrency controls
- Supabase plan sized for expected traffic
- database indexes for hot queries
- rate limiting on login/OTP/appointment APIs
- monitoring/logging
- backups and recovery
- pagination for large appointment/patient lists

The connection-limit problem that caused the current intermittent failure is addressed by this build.

## High-traffic Vercel + Supabase checklist

For Vercel/serverless production, use the **Supabase Transaction Pooler** connection string, not the Session Pooler.

- Vercel environment variable: `DATABASE_URL`
- Supabase connection mode: **Transaction pooler**
- Pooler port: **6543**
- Do not use the Supabase session pooler on port `5432` for this Vercel deployment.
- Redeploy after changing `DATABASE_URL` so every new function uses the same configuration.

The application keeps a small per-instance PostgreSQL pool and reuses it across warm serverless invocations. Public read APIs use short shared-cache windows to reduce repeated database reads. Appointment/auth/session endpoints remain uncached.

### One-time database setup

Run `supabase/schema.sql` in the Supabase SQL Editor once. It includes the required tables and performance indexes. Do not run database migrations from `instrumentation.ts` or on every request/cold start.

### Verify before launch

Open `/api/health`. A healthy deployment should return `{"ok":true,"status":"healthy","database":"connected"}` (or the equivalent connected response used by the current health route).

For sustained production traffic, monitor Supabase database CPU/connections and Vercel function errors. Application code cannot guarantee zero errors if the Supabase/Vercel plan limits are exceeded or a provider outage occurs; scaling the Supabase plan is the next step when sustained load approaches its limits.
