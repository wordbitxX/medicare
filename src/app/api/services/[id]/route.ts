import { NextResponse } from "next/server";
import { db } from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = Number(params.id);
    const [service] = await db.select().from(services).where(eq(services.id, id)).limit(1);
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }
    return NextResponse.json(service);
  } catch (error) {
    console.error("Error fetching service:", error);
    return NextResponse.json({ error: "Failed to fetch service" }, { status: 500 });
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
      .update(services)
      .set({
        name: body.name,
        category: body.category,
        description: body.description,
        durationMinutes: body.durationMinutes !== undefined ? Number(body.durationMinutes) : undefined,
        price: body.price !== undefined ? Number(body.price) : undefined,
        icon: body.icon,
        badge: body.badge,
        preparationInstructions: body.preparationInstructions,
        active: body.active,
        featured: body.featured,
      })
      .where(eq(services.id, id))
      .returning();

    return NextResponse.json({ success: true, service: updated });
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = Number(params.id);
    await db.delete(services).where(eq(services.id, id));
    return NextResponse.json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}
