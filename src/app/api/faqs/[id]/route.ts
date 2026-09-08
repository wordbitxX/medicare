import { NextResponse } from "next/server";
import { db } from "@/db";
import { faqs } from "@/db/schema";
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
      .update(faqs)
      .set({
        question: body.question,
        answer: body.answer,
        category: body.category,
        orderNumber: body.orderNumber !== undefined ? Number(body.orderNumber) : undefined,
        active: body.active,
      })
      .where(eq(faqs.id, id))
      .returning();

    return NextResponse.json({ success: true, faq: updated });
  } catch (error) {
    console.error("Error updating faq:", error);
    return NextResponse.json({ error: "Failed to update FAQ" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = Number(params.id);
    await db.delete(faqs).where(eq(faqs.id, id));
    return NextResponse.json({ success: true, message: "FAQ deleted successfully" });
  } catch (error) {
    console.error("Error deleting faq:", error);
    return NextResponse.json({ error: "Failed to delete FAQ" }, { status: 500 });
  }
}
