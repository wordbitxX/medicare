import { NextResponse } from "next/server";
import { publicCacheHeaders } from "@/lib/cache";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get("all") === "true";

    let results;
    if (includeAll) {
      results = await db.select().from(reviews).orderBy(desc(reviews.id));
    } else {
      results = await db
        .select()
        .from(reviews)
        .where(eq(reviews.published, true))
        .orderBy(desc(reviews.id));
    }

    return NextResponse.json(results, { headers: includeAll ? { "Cache-Control": "private, no-store" } : publicCacheHeaders() });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientName, rating, treatment, doctorName, comment, city } = body;

    if (!patientName || !comment || !treatment) {
      return NextResponse.json({ error: "Name, treatment, and comment are required" }, { status: 400 });
    }

    const [created] = await db
      .insert(reviews)
      .values({
        patientName: patientName.trim(),
        rating: Number(rating) || 5,
        treatment: treatment.trim(),
        doctorName: doctorName ? doctorName.trim() : null,
        comment: comment.trim(),
        city: city || "Lahore",
        published: true, // Default to published or ready for review
      })
      .returning();

    return NextResponse.json({ success: true, review: created });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
