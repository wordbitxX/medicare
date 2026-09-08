import { NextResponse } from "next/server";
import { db } from "@/db";
import { patients, appointments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = Number(params.id);
    const [patient] = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Fetch this patient's appointments
    const patientAppointments = await db
      .select()
      .from(appointments)
      .where(eq(appointments.patientId, id))
      .orderBy(desc(appointments.appointmentDate));

    return NextResponse.json({ patient, appointments: patientAppointments });
  } catch (error) {
    console.error("Error fetching patient details:", error);
    return NextResponse.json({ error: "Failed to fetch patient" }, { status: 500 });
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
      .update(patients)
      .set({
        name: body.name,
        phone: body.phone,
        cnic: body.cnic,
        email: body.email,
        gender: body.gender,
        age: body.age !== undefined ? Number(body.age) : undefined,
        bloodGroup: body.bloodGroup,
        address: body.address,
        city: body.city,
        emergencyContact: body.emergencyContact,
        allergies: body.allergies,
        medicalHistory: body.medicalHistory,
        totalVisits: body.totalVisits !== undefined ? Number(body.totalVisits) : undefined,
        outstandingBalance: body.outstandingBalance !== undefined ? Number(body.outstandingBalance) : undefined,
      })
      .where(eq(patients.id, id))
      .returning();

    return NextResponse.json({ success: true, patient: updated });
  } catch (error) {
    console.error("Error updating patient:", error);
    return NextResponse.json({ error: "Failed to update patient" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = Number(params.id);
    await db.delete(patients).where(eq(patients.id, id));
    return NextResponse.json({ success: true, message: "Patient deleted successfully" });
  } catch (error) {
    console.error("Error deleting patient:", error);
    return NextResponse.json({ error: "Failed to delete patient" }, { status: 500 });
  }
}
