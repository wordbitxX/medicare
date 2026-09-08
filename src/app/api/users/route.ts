import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, doctors } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      phone: users.phone,
      avatarUrl: users.avatarUrl,
      doctorId: users.doctorId,
      active: users.active,
      createdAt: users.createdAt,
      doctorName: doctors.name,
    })
    .from(users)
    .leftJoin(doctors, eq(users.doctorId, doctors.id))
    .orderBy(desc(users.createdAt), desc(users.id));

  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.name || !body.email || !body.password || !body.role) {
      return NextResponse.json({ error: "Name, email, password and role are required" }, { status: 400 });
    }

    if (body.role === "doctor" && !body.doctorId) {
      return NextResponse.json({ error: "Please link a doctor profile to this doctor account" }, { status: 400 });
    }

    const [created] = await db
      .insert(users)
      .values({
        name: String(body.name).trim(),
        email: String(body.email).trim().toLowerCase(),
        password: String(body.password),
        role: body.role,
        phone: body.phone ? String(body.phone).trim() : null,
        avatarUrl: body.avatarUrl ? String(body.avatarUrl).trim() : null,
        doctorId: body.role === "doctor" ? Number(body.doctorId) : null,
        active: body.active !== undefined ? Boolean(body.active) : true,
      })
      .returning();

    return NextResponse.json({ success: true, user: created });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create staff account" }, { status: 500 });
  }
}
