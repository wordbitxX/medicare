import { NextResponse } from "next/server";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = Number(params.id);
    const body = await request.json();

    const [updated] = await db
      .update(reviews)
      .set({
        published: body.published,
        rating: body.rating !== undefined ? Number(body.rating) : undefined,
        comment: body.comment,
        treatment: body.treatment,
        doctorName: body.doctorName,
      })
      .where(eq(reviews.id, id))
      .returning();

    return NextResponse.json({ success: true, review: updated });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = Number(params.id);
    await db.delete(reviews).where(eq(reviews.id, id));
    return NextResponse.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
