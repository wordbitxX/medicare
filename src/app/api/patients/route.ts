import { NextResponse } from "next/server";
import { db } from "@/db";
import { patients } from "@/db/schema";
import { desc, or, ilike } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      const filtered = await db
        .select()
        .from(patients)
        .where(
          or(
            ilike(patients.name, q),
            ilike(patients.phone, q),
            ilike(patients.mrn, q),
            ilike(patients.email, q),
            ilike(patients.cnic, q)
          )
        )
        .orderBy(desc(patients.id));
      return NextResponse.json(filtered);
    }

    const allPatients = await db.select().from(patients).orderBy(desc(patients.id));
    return NextResponse.json(allPatients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const generatedMrn = body.mrn || `MRN-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const [created] = await db
      .insert(patients)
      .values({
        mrn: generatedMrn,
        name: body.name,
        phone: body.phone,
        cnic: body.cnic || null,
        email: body.email || null,
        gender: body.gender || "Male",
        age: Number(body.age) || 30,
        bloodGroup: body.bloodGroup || "O+",
        address: body.address || null,
        city: body.city || "Lahore",
        emergencyContact: body.emergencyContact || null,
        allergies: body.allergies || null,
        medicalHistory: body.medicalHistory || null,
        totalVisits: Number(body.totalVisits) || 1,
        outstandingBalance: Number(body.outstandingBalance) || 0,
      })
      .returning();

    return NextResponse.json({ success: true, patient: created });
  } catch (error) {
    console.error("Error creating patient:", error);
    return NextResponse.json({ error: "Failed to create patient" }, { status: 500 });
  }
}
