import { NextResponse } from "next/server";
import { publicCacheHeaders } from "@/lib/cache";
import { db } from "@/db";
import { doctors } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get("all") === "true";

    const query = db.select().from(doctors);
    const results = includeAll
      ? await query.orderBy(desc(doctors.featured), doctors.id)
      : await query.where(eq(doctors.active, true)).orderBy(desc(doctors.featured), doctors.id);

    return NextResponse.json(results, { headers: includeAll ? { "Cache-Control": "private, no-store" } : publicCacheHeaders() });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json({ error: "Failed to fetch doctors" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const [created] = await db
      .insert(doctors)
      .values({
        name: body.name,
        title: body.title || "Dr.",
        qualification: body.qualification,
        specialty: body.specialty,
        experienceYears: Number(body.experienceYears) || 5,
        fee: Number(body.fee) || 2500,
        rating: body.rating || "4.9",
        reviewsCount: Number(body.reviewsCount) || 10,
        roomNo: body.roomNo || "Consultation Suite 101",
        avatarUrl: body.avatarUrl || null,
        bio: body.bio || "Specialist doctor at Medicare Plus Clinic.",
        availableDays: body.availableDays || "Mon,Tue,Wed,Thu,Fri",
        shiftStart: body.shiftStart || "09:00 AM",
        shiftEnd: body.shiftEnd || "05:00 PM",
        slotDurationMinutes: Number(body.slotDurationMinutes) || 20,
        active: body.active !== undefined ? body.active : true,
        featured: body.featured !== undefined ? body.featured : false,
      })
      .returning();

    return NextResponse.json({ success: true, doctor: created });
  } catch (error) {
    console.error("Error creating doctor:", error);
    return NextResponse.json({ error: "Failed to create doctor" }, { status: 500 });
  }
}
