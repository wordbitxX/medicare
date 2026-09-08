/**
 * Next.js instrumentation hook.
 *
 * IMPORTANT: Do not run migrations or seed data here. Vercel is serverless,
 * so a deployment can have many cold starts. Running DDL/seed work from every
 * instance can create connection spikes and races against Supabase.
 *
 * Schema setup is intentionally an explicit one-time operation through
 * Supabase SQL Editor (preferred) or the protected admin setup flow.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  console.log(
    `[boot] DATABASE_URL configured: ${process.env.DATABASE_URL ? "yes" : "NO"}`
  );
}
