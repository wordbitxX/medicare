import { NextResponse } from "next/server";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ALLOWED_STATUSES = new Set([
  "Pending",
  "Confirmed",
  "In Consultation",
  "Completed",
  "Cancelled",
  "No-Show",
]);

function normalizeStatus(value: unknown): string {
  const raw = String(value ?? "").trim();
  const match = [...ALLOWED_STATUSES].find((status) => status.toLowerCase() === raw.toLowerCase());
  return match || "Pending";
}

export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = Number(params.id);
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, id))
      .limit(1);

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }
    return NextResponse.json(appointment, { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" } });
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return NextResponse.json({ error: "Failed to fetch appointment" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = await props.params;
    const id = Number(params.id);
    const body = await request.json();

    const requestedStatus = body.status !== undefined ? normalizeStatus(body.status) : undefined;

    const [existing] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Doctors may only work on their own paid/confirmed appointments.
    // They can move the clinical workflow between In Consultation, Completed,
    // and No-Show, and can save clinical notes/prescriptions. They cannot
    // change payment, fee, doctor assignment, date, or time.
    if (session.role === "doctor") {
      if (session.doctorId !== existing.doctorId) {
        return NextResponse.json(
          { error: "You can only access appointments assigned to you." },
          { status: 403 }
        );
      }

      if (existing.paymentStatus !== "Paid") {
        return NextResponse.json(
          { error: "This patient will appear in the doctor portal after reception confirms the consultation fee." },
          { status: 403 }
        );
      }

      const allowedDoctorStatuses = new Set([
        "Confirmed",
        "In Consultation",
        "Completed",
        "No-Show",
      ]);

      if (requestedStatus && !allowedDoctorStatuses.has(requestedStatus)) {
        return NextResponse.json(
          { error: "Doctors can set only In Consultation, Completed, or No-Show." },
          { status: 403 }
        );
      }

      const hasOnlyClinicalFields =
        body.doctorNotes !== undefined ||
        body.prescription !== undefined ||
        body.status !== undefined;

      if (!hasOnlyClinicalFields || body.paymentStatus !== undefined || body.fee !== undefined || body.doctorId !== undefined || body.appointmentDate !== undefined || body.appointmentTime !== undefined || body.patientNotes !== undefined) {
        return NextResponse.json(
          { error: "Doctors can update clinical status, notes, and prescription only." },
          { status: 403 }
        );
      }

      const [updatedDoctorAppointment] = await db
        .update(appointments)
        .set({
          doctorNotes: body.doctorNotes !== undefined ? body.doctorNotes : undefined,
          prescription: body.prescription !== undefined ? body.prescription : undefined,
          status: requestedStatus ?? existing.status,
        })
        .where(eq(appointments.id, id))
        .returning();

      return NextResponse.json(
        { success: true, appointment: updatedDoctorAppointment },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    // Operational edits are restricted to super admin / receptionist.

    // In this clinic workflow, completing the appointment also completes the
    // consultation fee unless reception explicitly chooses another fee status.
    // The database keeps the existing Paid/Pending/Refunded values for
    // compatibility, while the UI labels Paid as "Completed".
    const nextPaymentStatus =
      body.paymentStatus !== undefined
        ? String(body.paymentStatus)
        : requestedStatus === "Completed"
          ? "Paid"
          : existing.paymentStatus;

    // Once reception confirms the consultation fee, a still-pending booking
    // becomes confirmed so it enters the assigned doctor's clinical queue.
    const nextAppointmentStatus =
      nextPaymentStatus === "Paid" && existing.status === "Pending"
        ? "Confirmed"
        : (requestedStatus ?? existing.status);

    const [updated] = await db
      .update(appointments)
      .set({
        status: nextAppointmentStatus,
        appointmentDate: body.appointmentDate,
        appointmentTime: body.appointmentTime,
        paymentStatus: nextPaymentStatus,
        fee: body.fee !== undefined ? Number(body.fee) : undefined,
        patientNotes: body.patientNotes,
        doctorId: body.doctorId !== undefined ? Number(body.doctorId) : undefined,
      })
      .where(eq(appointments.id, id))
      .returning();

    return NextResponse.json({ success: true, appointment: updated }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role === "doctor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = await props.params;
    const id = Number(params.id);
    await db.delete(appointments).where(eq(appointments.id, id));
    return NextResponse.json({ success: true, message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json({ error: "Failed to delete appointment" }, { status: 500 });
  }
}
