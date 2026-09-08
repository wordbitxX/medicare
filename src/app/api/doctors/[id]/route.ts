import { NextResponse } from "next/server";
import { db } from "@/db";
import { doctors } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = Number(params.id);
    const [doctor] = await db.select().from(doctors).where(eq(doctors.id, id)).limit(1);
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }
    return NextResponse.json(doctor);
  } catch (error) {
    console.error("Error fetching doctor:", error);
    return NextResponse.json({ error: "Failed to fetch doctor" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = Number(params.id);
    const body = await request.json();

    const [updated] = await db
      .update(doctors)
      .set({
        name: body.name,
        title: body.title,
        qualification: body.qualification,
        specialty: body.specialty,
        experienceYears: body.experienceYears !== undefined ? Number(body.experienceYears) : undefined,
        fee: body.fee !== undefined ? Number(body.fee) : undefined,
        rating: body.rating,
        reviewsCount: body.reviewsCount !== undefined ? Number(body.reviewsCount) : undefined,
        roomNo: body.roomNo,
        avatarUrl: body.avatarUrl,
        bio: body.bio,
        availableDays: body.availableDays,
        shiftStart: body.shiftStart,
        shiftEnd: body.shiftEnd,
        slotDurationMinutes: body.slotDurationMinutes !== undefined ? Number(body.slotDurationMinutes) : undefined,
        active: body.active,
        featured: body.featured,
      })
      .where(eq(doctors.id, id))
      .returning();

    return NextResponse.json({ success: true, doctor: updated });
  } catch (error) {
    console.error("Error updating doctor:", error);
    return NextResponse.json({ error: "Failed to update doctor" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = Number(params.id);
    await db.delete(doctors).where(eq(doctors.id, id));
    return NextResponse.json({ success: true, message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    return NextResponse.json({ error: "Failed to delete doctor" }, { status: 500 });
  }
}
