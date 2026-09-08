import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

/** True when DATABASE_URL is present in the environment. */
export const databaseConfigured = Boolean(databaseUrl);

function buildConnectionString(url: string): string {
  let out = url;
  // Supabase transaction pooler (port 6543) requires pgbouncer=true, otherwise
  // prepared statements (used by node-postgres/drizzle) fail at runtime.
  if (out.includes("pooler.supabase") && out.includes(":6543") && !out.includes("pgbouncer")) {
    out += out.includes("?") ? "&pgbouncer=true" : "?pgbouncer=true";
  }
  return out;
}

function buildSslOptions(url: string) {
  // Supabase endpoints require TLS. If the connection string does not carry an
  // explicit sslmode, enable SSL so node-postgres does not attempt a plain
  // connection (which Supabase rejects with a pg_hba.conf error).
  const isSupabase = /supabase\.(co|com|in)/i.test(url);
  if (isSupabase && !url.includes("sslmode=")) {
    return { rejectUnauthorized: false };
  }
  if (process.env.PGSSL === "true") {
    return { rejectUnauthorized: false };
  }
  return undefined;
}

function createPool(): Pool {
  if (!databaseUrl) {
    // Do NOT throw at module load — that would kill the whole server process
    // (and show a generic host error page). Instead return a pool that fails
    // per-query with a clear, actionable message, keeping /api/health and the
    // server logs able to explain the misconfiguration.
    console.error(
      "[db] DATABASE_URL is NOT set. The server will start, but every database query will fail. " +
        "Add DATABASE_URL (Supabase transaction-pooler string on port 6543) in your host environment variables."
    );
    return new Pool({
      connectionString: "postgres://missing:missing@127.0.0.1:5432/missing_database_url",
      connectionTimeoutMillis: 4000,
    });
  }

  const isTransactionPooler =
    /pooler\.supabase\.(com|co|in)/i.test(databaseUrl) &&
    /:6543(?:[/?]|$)/.test(databaseUrl);

  // Vercel is serverless: many short-lived instances can exist at once.
  // Keep each instance's local pool deliberately tiny. With Supabase's
  // Transaction Pooler (6543), connections are multiplexed upstream and
  // this avoids exhausting the project's session connection limit.
  return new Pool({
    connectionString: buildConnectionString(databaseUrl),
    ssl: buildSslOptions(databaseUrl),
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000,
    max: isTransactionPooler ? 3 : 1,
    // Recycle long-lived connections periodically. This helps serverless
    // deployments avoid stale connections after network/database changes.
    maxUses: 5000,
    maxLifetimeSeconds: 300,
    allowExitOnIdle: true,
  });
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool = globalForDb.__arenaNextJsPostgresqlPool ?? createPool();

// Reuse the pool whenever the Vercel/Node runtime keeps the process warm.
globalForDb.__arenaNextJsPostgresqlPool = pool;

export const db = drizzle(pool);

/** Lightweight connectivity probe used by /api/health and instrumentation. */
export async function probeDatabase(): Promise<{ ok: boolean; detail: string }> {
  if (!databaseConfigured) {
    return {
      ok: false,
      detail: "DATABASE_URL is not set in the environment variables.",
    };
  }
  try {
    await pool.query("select 1");
    return { ok: true, detail: "connected" };
  } catch (err: any) {
    return { ok: false, detail: err?.message || String(err) };
  }
}
