import { NextResponse } from "next/server";
import { db, probeDatabase } from "@/db";
import { bootstrapDatabase } from "@/db/bootstrap";
import { ensureSchema } from "@/db/migrate";
import { getSession } from "@/lib/auth";
import { blogPosts, doctors, services, users } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function counts() {
  const [d] = await db.select({ c: sql<number>`count(*)` }).from(doctors);
  const [s] = await db.select({ c: sql<number>`count(*)` }).from(services);
  const [b] = await db.select({ c: sql<number>`count(*)` }).from(blogPosts);
  const [u] = await db.select({ c: sql<number>`count(*)` }).from(users);
  return {
    doctors: Number(d?.c || 0),
    services: Number(s?.c || 0),
    blogPosts: Number(b?.c || 0),
    users: Number(u?.c || 0),
  };
}

export async function GET() {
  const probe = await probeDatabase();
  if (!probe.ok) {
    return NextResponse.json(
      { ok: false, status: "database_unreachable", detail: probe.detail },
      { status: 503 }
    );
  }
  try {
    await ensureSchema();
    return NextResponse.json({ ok: true, counts: await counts() });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, status: "schema_error", detail: err?.message || String(err) },
      { status: 500 }
    );
  }
}

/**
 * On-demand demo seeding.
 * Allowed when:
 *  - the database has NO user accounts at all (first-run bootstrap — nobody
 *    can be authenticated yet, and seeding creates the staff logins), or
 *  - the caller is a signed-in super_admin.
 * Seeding itself is idempotent: it only runs while the doctors table is empty.
 */
export async function POST() {
  const probe = await probeDatabase();
  if (!probe.ok) {
    return NextResponse.json(
      { ok: false, status: "database_unreachable", detail: probe.detail },
      { status: 503 }
    );
  }

  try {
    await ensureSchema();
    const before = await counts();

    const session = await getSession();
    const firstRun = before.users === 0;
    if (!firstRun && (!session || session.role !== "super_admin")) {
      return NextResponse.json(
        { error: "Only a super admin can seed an existing database." },
        { status: 403 }
      );
    }

    await bootstrapDatabase();
    const after = await counts();

    return NextResponse.json({
      ok: true,
      seeded: after.doctors > before.doctors,
      before,
      after,
      message:
        after.doctors > before.doctors
          ? "Demo data seeded successfully."
          : "Database already contains data — nothing was seeded.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, status: "seed_error", detail: err?.message || String(err) },
      { status: 500 }
    );
  }
}
