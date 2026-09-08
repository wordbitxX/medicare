import { NextResponse } from "next/server";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const results = await db.select().from(leads).orderBy(desc(leads.id));
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, serviceInterested, source, notes } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "Name and phone number are required" }, { status: 400 });
    }

    const [created] = await db
      .insert(leads)
      .values({
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : null,
        serviceInterested: serviceInterested || "General Inquiry",
        source: source || "Website Form",
        status: "New",
        notes: notes || null,
      })
      .returning();

    return NextResponse.json({ success: true, lead: created });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}
