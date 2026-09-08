import { NextResponse } from "next/server";
import { getPatientSession } from "@/lib/patient-auth";
import { db } from "@/db";
import { patientAccounts, appointments, doctors } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getPatientSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, account: null });
    }

    const [account] = await db
      .select()
      .from(patientAccounts)
      .where(eq(patientAccounts.id, session.accountId))
      .limit(1);

    if (!account) {
      return NextResponse.json({ authenticated: false, account: null });
    }

    // Fetch this patient's appointments
    let myAppointments: any[] = [];
    if (account.patientId) {
      myAppointments = await db
        .select({
          id: appointments.id,
          appointmentNumber: appointments.appointmentNumber,
          appointmentDate: appointments.appointmentDate,
          appointmentTime: appointments.appointmentTime,
          status: appointments.status,
          fee: appointments.fee,
          paymentStatus: appointments.paymentStatus,
          visitType: appointments.visitType,
          doctorName: doctors.name,
          doctorSpecialty: doctors.specialty,
          doctorRoom: doctors.roomNo,
          patientNotes: appointments.patientNotes,
          doctorNotes: appointments.doctorNotes,
          prescription: appointments.prescription,
          createdAt: appointments.createdAt,
        })
        .from(appointments)
        .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
        .where(eq(appointments.patientId, account.patientId))
        .orderBy(desc(appointments.appointmentDate), desc(appointments.id))
        .limit(50);
    } else {
      // fallback: match by phone
      myAppointments = await db
        .select({
          id: appointments.id,
          appointmentNumber: appointments.appointmentNumber,
          appointmentDate: appointments.appointmentDate,
          appointmentTime: appointments.appointmentTime,
          status: appointments.status,
          fee: appointments.fee,
          paymentStatus: appointments.paymentStatus,
          visitType: appointments.visitType,
          doctorName: doctors.name,
          doctorSpecialty: doctors.specialty,
          doctorRoom: doctors.roomNo,
          patientNotes: appointments.patientNotes,
          doctorNotes: appointments.doctorNotes,
          prescription: appointments.prescription,
          createdAt: appointments.createdAt,
        })
        .from(appointments)
        .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
        .where(eq(appointments.patientPhone, account.phone))
        .orderBy(desc(appointments.appointmentDate), desc(appointments.id))
        .limit(50);
    }

    const safeAccount = {
      id: account.id,
      phone: account.phone,
      cnic: account.cnic,
      email: account.email,
      firstName: account.firstName,
      lastName: account.lastName,
      gender: account.gender,
      dateOfBirth: account.dateOfBirth,
      bloodGroup: account.bloodGroup,
      city: account.city,
      address: account.address,
      emergencyContact: account.emergencyContact,
      allergies: account.allergies,
      verified: account.verified,
      createdAt: account.createdAt,
    };

    return NextResponse.json({
      authenticated: true,
      account: safeAccount,
      appointments: myAppointments,
    });
  } catch (err) {
    console.error("me route error:", err);
    return NextResponse.json({ error: "Failed to load profile." }, { status: 500 });
  }
}
