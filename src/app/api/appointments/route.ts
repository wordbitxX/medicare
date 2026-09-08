import { NextResponse } from "next/server";
import { db } from "@/db";
import { appointments, doctors, services, patients } from "@/db/schema";
import { eq, desc, and, ne, inArray } from "drizzle-orm";
import { normalisePhone, phoneVariants } from "@/lib/phone";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function parseTime(value: string) {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();
  if (hours === 12) hours = 0;
  if (period === "PM") hours += 12;
  return hours * 60 + minutes;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const doctorId = searchParams.get("doctorId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const allAppointments = await db
      .select({
        id: appointments.id,
        appointmentNumber: appointments.appointmentNumber,
        patientId: appointments.patientId,
        patientName: appointments.patientName,
        patientPhone: appointments.patientPhone,
        patientEmail: appointments.patientEmail,
        patientGender: appointments.patientGender,
        patientAge: appointments.patientAge,
        doctorId: appointments.doctorId,
        doctorName: doctors.name,
        doctorSpecialty: doctors.specialty,
        doctorRoom: doctors.roomNo,
        serviceId: appointments.serviceId,
        serviceName: services.name,
        appointmentDate: appointments.appointmentDate,
        appointmentTime: appointments.appointmentTime,
        visitType: appointments.visitType,
        status: appointments.status,
        fee: appointments.fee,
        paymentStatus: appointments.paymentStatus,
        patientNotes: appointments.patientNotes,
        doctorNotes: appointments.doctorNotes,
        prescription: appointments.prescription,
        createdAt: appointments.createdAt,
      })
      .from(appointments)
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .orderBy(desc(appointments.appointmentDate), desc(appointments.id));

    const session = await getSession();
    let filtered = allAppointments;

    // Doctors must only receive their own appointments and only after
    // reception/admin confirms the consultation fee/payment. This keeps
    // unpaid patients out of the clinical queue and also enforces the rule
    // server-side instead of relying only on the UI.
    if (session?.role === "doctor") {
      if (!session.doctorId) {
        filtered = [];
      } else {
        filtered = filtered.filter(
          (a) => a.doctorId === session.doctorId && a.paymentStatus === "Paid" && a.status !== "Cancelled"
        );
      }
    }

    if (date) {
      filtered = filtered.filter((a) => a.appointmentDate === date);
    }
    if (doctorId && doctorId !== "all") {
      filtered = filtered.filter((a) => a.doctorId === Number(doctorId));
    }
    if (status && status !== "all") {
      filtered = filtered.filter((a) => a.status.toLowerCase() === status.toLowerCase());
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (a) =>
          a.patientName.toLowerCase().includes(q) ||
          a.patientPhone.toLowerCase().includes(q) ||
          a.appointmentNumber.toLowerCase().includes(q) ||
          (a.doctorName && a.doctorName.toLowerCase().includes(q))
      );
    }

    return NextResponse.json(filtered, { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" } });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      patientName,
      patientPhone,
      patientEmail,
      patientGender,
      patientAge,
      patientCnic,
      bloodGroup,
      address,
      emergencyContact,
      allergies,
      doctorId,
      serviceId,
      appointmentDate,
      appointmentTime,
      visitType,
      patientNotes,
    } = body;

    if (!patientName || !patientPhone || !doctorId || !appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { error: "Name, phone, doctor, date, and time slot are required" },
        { status: 400 }
      );
    }

    const selectedDate = new Date(`${appointmentDate}T12:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(selectedDate.getTime()) || selectedDate < today) {
      return NextResponse.json({ error: "Please select a valid future appointment date" }, { status: 400 });
    }

    const [doctor] = await db
      .select()
      .from(doctors)
      .where(and(eq(doctors.id, Number(doctorId)), eq(doctors.active, true)))
      .limit(1);

    if (!doctor) {
      return NextResponse.json({ error: "Selected doctor is unavailable" }, { status: 404 });
    }

    const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][selectedDate.getDay()];
    const workingDays = doctor.availableDays.split(",").map((day) => day.trim());
    if (!workingDays.includes(dayName)) {
      return NextResponse.json(
        { error: `${doctor.name} does not hold OPD on ${dayName}. Please choose another date.` },
        { status: 409 }
      );
    }

    const requestedMinutes = parseTime(appointmentTime);
    const shiftStart = parseTime(doctor.shiftStart);
    const shiftEnd = parseTime(doctor.shiftEnd);
    if (
      requestedMinutes === null ||
      shiftStart === null ||
      shiftEnd === null ||
      requestedMinutes < shiftStart ||
      requestedMinutes + doctor.slotDurationMinutes > shiftEnd ||
      (requestedMinutes - shiftStart) % doctor.slotDurationMinutes !== 0
    ) {
      return NextResponse.json(
        { error: "Selected time is outside the doctor's configured OPD schedule" },
        { status: 409 }
      );
    }

    // Slots are always bookable — we allow multiple patients in a slot
    // (no-show recovery) but flag it so reception can manage.
    const [existingSlot] = await db
      .select({ id: appointments.id, patientName: appointments.patientName })
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, Number(doctorId)),
          eq(appointments.appointmentDate, appointmentDate),
          eq(appointments.appointmentTime, appointmentTime),
          ne(appointments.status, "Cancelled")
        )
      )
      .limit(1);

    // 1. Find or create patient record using phone number or CNIC.
    // Canonical phone form so 03xx and 92xx always match the same record.
    const normalizedPhone = normalisePhone(patientPhone);
    const normalizedCnic = patientCnic ? String(patientCnic).trim() : null;

    let patientRecord = await db
      .select()
      .from(patients)
      .where(inArray(patients.phone, phoneVariants(patientPhone)))
      .limit(1)
      .then((rows) => rows[0]);

    if (!patientRecord && normalizedCnic) {
      patientRecord = await db
        .select()
        .from(patients)
        .where(eq(patients.cnic, normalizedCnic))
        .limit(1)
        .then((rows) => rows[0]);
    }

    if (!patientRecord) {
      const [newPatient] = await db
        .insert(patients)
        .values({
          mrn: `MRN-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
          name: patientName.trim(),
          phone: normalizedPhone,
          cnic: normalizedCnic,
          email: patientEmail ? patientEmail.trim() : null,
          gender: patientGender || "Male",
          age: patientAge ? Number(patientAge) : 30,
          bloodGroup: bloodGroup ? String(bloodGroup).trim() : null,
          address: address ? String(address).trim() : null,
          emergencyContact: emergencyContact ? String(emergencyContact).trim() : null,
          allergies: allergies ? String(allergies).trim() : null,
          totalVisits: 1,
        })
        .returning();
      patientRecord = newPatient;
    } else {
      await db
        .update(patients)
        .set({
          name: patientName.trim(),
          phone: normalizedPhone,
          cnic: normalizedCnic || patientRecord.cnic,
          email: patientEmail ? patientEmail.trim() : patientRecord.email,
          gender: patientGender || patientRecord.gender,
          age: patientAge ? Number(patientAge) : patientRecord.age,
          totalVisits: (patientRecord.totalVisits || 1) + 1,
          bloodGroup: bloodGroup ? String(bloodGroup).trim() : patientRecord.bloodGroup,
          address: address ? String(address).trim() : patientRecord.address,
          emergencyContact: emergencyContact
            ? String(emergencyContact).trim()
            : patientRecord.emergencyContact,
          allergies: allergies ? String(allergies).trim() : patientRecord.allergies,
        })
        .where(eq(patients.id, patientRecord.id));
    }

    // 2. Use the validated doctor's configured consultation fee
    const fee = doctor.fee;

    // 3. Generate a collision-resistant appointment reference
    const appointmentCode = `MED-${new Date().getFullYear()}-${Date.now().toString().slice(-7)}${Math.floor(Math.random() * 90 + 10)}`;

    const [createdAppointment] = await db
      .insert(appointments)
      .values({
        appointmentNumber: appointmentCode,
        patientId: patientRecord ? patientRecord.id : null,
        patientName: patientName.trim(),
        patientPhone: normalizedPhone,
        patientCnic: normalizedCnic,
        patientEmail: patientEmail ? patientEmail.trim() : null,
        patientGender: patientGender || "Male", 
        patientAge: Number(patientAge) || 30,
        doctorId: Number(doctorId),
        serviceId: serviceId ? Number(serviceId) : null,
        appointmentDate: appointmentDate,
        appointmentTime: appointmentTime,
        visitType: visitType || "New Consultation",
        status: "Pending",
        fee: fee,
        paymentStatus: "Pending",
        patientNotes: patientNotes || null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      appointment: createdAppointment,
      appointmentCode: appointmentCode,
      message: "Appointment booked successfully!",
      slotAlreadyHeld: Boolean(existingSlot),
    });
  } catch (error) {
    console.error("Error booking appointment:", error);
    return NextResponse.json({ error: "Failed to book appointment" }, { status: 500 });
  }
}
