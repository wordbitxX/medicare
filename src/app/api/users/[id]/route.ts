import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const [updated] = await db
      .update(users)
      .set({
        name: body.name,
        email: body.email ? String(body.email).trim().toLowerCase() : undefined,
        password: body.password || undefined,
        role: body.role,
        phone: body.phone,
        avatarUrl: body.avatarUrl,
        doctorId: body.role === "doctor" ? (body.doctorId ? Number(body.doctorId) : null) : null,
        active: body.active,
      })
      .where(eq(users.id, Number(id)))
      .returning();

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update staff account" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await db.delete(users).where(eq(users.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete staff account" }, { status: 500 });
  }
}
