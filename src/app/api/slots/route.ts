import { NextResponse } from "next/server";
import { db } from "@/db";
import { doctors, appointments } from "@/db/schema";
import { and, eq, ne } from "drizzle-orm";

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

function formatTime(totalMinutes: number) {
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  return `${String(hours12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = Number(searchParams.get("doctorId"));
    const date = searchParams.get("date");

    if (!doctorId || !date) {
      return NextResponse.json({ error: "doctorId and date are required" }, { status: 400 });
    }

    const [doctor] = await db
      .select()
      .from(doctors)
      .where(and(eq(doctors.id, doctorId), eq(doctors.active, true)))
      .limit(1);

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found or inactive" }, { status: 404 });
    }

    const selectedDate = new Date(`${date}T12:00:00`);
    if (Number.isNaN(selectedDate.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][selectedDate.getDay()];
    const workingDays = doctor.availableDays.split(",").map((day) => day.trim());

    if (!workingDays.includes(dayName)) {
      return NextResponse.json({
        doctorId,
        date,
        available: false,
        reason: `${doctor.name} does not hold OPD on ${dayName}.`,
        slots: [],
      });
    }

    const start = parseTime(doctor.shiftStart);
    const end = parseTime(doctor.shiftEnd);
    if (start === null || end === null || end <= start) {
      return NextResponse.json({ error: "Doctor shift is not configured correctly" }, { status: 400 });
    }

    // All active (non-cancelled) bookings for this doctor on this date.
    // We include them so the UI can display slot occupancy — but slots are never
    // disabled. A patient can always choose a "taken" slot; they will be shown a
    // confirmation dialog before finalising.
    const existing = await db
      .select({
        time: appointments.appointmentTime,
        patientName: appointments.patientName,
        status: appointments.status,
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, doctorId),
          eq(appointments.appointmentDate, date),
          ne(appointments.status, "Cancelled")
        )
      );

    // Map: time → count of active bookings in that slot
    const slotBookingCount: Record<string, number> = {};
    for (const row of existing) {
      slotBookingCount[row.time] = (slotBookingCount[row.time] || 0) + 1;
    }

    const duration = Math.max(10, doctor.slotDurationMinutes || 20);
    const slots: Array<{ time: string; available: boolean; booked: boolean; bookingCount: number }> = [];

    for (let cursor = start; cursor + duration <= end; cursor += duration) {
      const time = formatTime(cursor);
      const bookingCount = slotBookingCount[time] || 0;
      slots.push({
        time,
        available: true,      // ALWAYS selectable
        booked: bookingCount > 0,  // Visual indicator only
        bookingCount,
      });
    }

    return NextResponse.json({
      doctorId,
      date,
      available: true,
      doctorName: doctor.name,
      shift: `${doctor.shiftStart} - ${doctor.shiftEnd}`,
      slotDurationMinutes: duration,
      slots,
    }, {
      headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30" },
    });
  } catch (error) {
    console.error("Error generating slots:", error);
    return NextResponse.json({ error: "Failed to generate appointment slots" }, { status: 500 });
  }
}
