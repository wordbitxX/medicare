import { NextResponse } from "next/server";
import { db, probeDatabase } from "@/db";
import { blogPosts, doctors, services, users } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const probe = await probeDatabase();

  if (!probe.ok) {
    return NextResponse.json(
      {
        ok: false,
        status: "database_unreachable",
        detail: probe.detail,
        hint: "Use the Supabase Transaction Pooler connection string (port 6543) for Vercel and verify DATABASE_URL in Vercel Environment Variables. See DEPLOYMENT.md.",
      },
      { status: 503 }
    );
  }

  let counts: { doctors: number; services: number; blogPosts: number; users: number } | null = null;
  try {
    const [d] = await db.select({ c: sql<number>`count(*)` }).from(doctors);
    const [s] = await db.select({ c: sql<number>`count(*)` }).from(services);
    const [b] = await db.select({ c: sql<number>`count(*)` }).from(blogPosts);
    const [u] = await db.select({ c: sql<number>`count(*)` }).from(users);
    counts = {
      doctors: Number(d?.c || 0),
      services: Number(s?.c || 0),
      blogPosts: Number(b?.c || 0),
      users: Number(u?.c || 0),
    };
  } catch (err) {
    console.error("[health] count query failed:", err);
  }

  const empty = counts && counts.doctors === 0 && counts.users === 0;

  return NextResponse.json({
    ok: true,
    database: probe.detail,
    counts,
    ...(empty
      ? {
          notice:
            "Database is connected but empty. Run the one-time database setup from Supabase SQL Editor (preferred) or POST /api/admin/seed, then seed demo data if needed.",
        }
      : {}),
  });
}
