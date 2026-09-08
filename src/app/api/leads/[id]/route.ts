import { NextResponse } from "next/server";
import { db } from "@/db";
import { leads } from "@/db/schema";
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
      .update(leads)
      .set({
        status: body.status,
        notes: body.notes,
        serviceInterested: body.serviceInterested,
      })
      .where(eq(leads.id, id))
      .returning();

    return NextResponse.json({ success: true, lead: updated });
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = Number(params.id);
    await db.delete(leads).where(eq(leads.id, id));
    return NextResponse.json({ success: true, message: "Lead deleted successfully" });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
