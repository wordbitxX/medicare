import { ensureSchema } from "./migrate";
import { db } from "./index";
import { doctors } from "./schema";
import { sql } from "drizzle-orm";

/**
 * Creates the schema on first request/server start. The promise guard avoids
 * concurrent cold-start requests racing each other. Demo seeding is opt-in
 * in production via SEED_DEMO_DATA=true.
 */
let bootstrapPromise: Promise<void> | null = null;

export async function bootstrapDatabase(): Promise<void> {
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    await ensureSchema();

    // Seed demo data on a brand-new (empty) database BY DEFAULT — including
    // production — so a freshly attached Supabase instance shows doctors,
    // services, blogs, staff logins etc. immediately.
    // Set SEED_DEMO_DATA=false to keep a production database empty.
    const seed = process.env.SEED_DEMO_DATA !== "false";
    if (!seed) {
      console.log("[bootstrap] SEED_DEMO_DATA=false — leaving database empty.");
      return;
    }

    try {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(doctors);

      if (Number(count || 0) > 0) return;

      console.log("[bootstrap] Empty database detected — seeding demo data...");
      const { seedDatabase } = await import("./seed");
      await seedDatabase();
      const { expandDoctors } = await import("./expand-doctors");
      await expandDoctors();
      console.log("[bootstrap] Demo data seeded.");
    } catch (err) {
      console.error("[bootstrap] Seeding skipped due to error:", err);
    }
  })();

  try {
    await bootstrapPromise;
  } catch (err) {
    // Do not cache a failed migration forever. A transient DB startup issue
    // can succeed on the next request after a short restart/retry.
    bootstrapPromise = null;
    throw err;
  }
}
