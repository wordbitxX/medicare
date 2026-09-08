import { NextResponse } from "next/server";
import { db } from "@/db";
import { appointments, patients, doctors, services, leads, reviews } from "@/db/schema";
import { sql, eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const todayStr = new Date().toISOString().split("T")[0];

    // Total counts
    const [patientCountRes] = await db.select({ count: sql<number>`count(*)` }).from(patients);
    const [appointmentCountRes] = await db.select({ count: sql<number>`count(*)` }).from(appointments);
    const [doctorCountRes] = await db.select({ count: sql<number>`count(*)` }).from(doctors);
    const [serviceCountRes] = await db.select({ count: sql<number>`count(*)` }).from(services);
    const [leadCountRes] = await db.select({ count: sql<number>`count(*)` }).from(leads);
    const [reviewCountRes] = await db.select({ count: sql<number>`count(*)` }).from(reviews);

    // Appointments query for today and calculations
    const allAppointments = await db
      .select({
        id: appointments.id,
        appointmentNumber: appointments.appointmentNumber,
        patientName: appointments.patientName,
        patientPhone: appointments.patientPhone,
        appointmentDate: appointments.appointmentDate,
        appointmentTime: appointments.appointmentTime,
        status: appointments.status,
        fee: appointments.fee,
        paymentStatus: appointments.paymentStatus,
        visitType: appointments.visitType,
        doctorId: appointments.doctorId,
        doctorName: doctors.name,
        doctorSpecialty: doctors.specialty,
        serviceName: services.name,
      })
      .from(appointments)
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .orderBy(desc(appointments.appointmentDate), desc(appointments.id));

    const todayAppointments = allAppointments.filter((a) => a.appointmentDate === todayStr);

    let totalRevenue = 0;
    let pendingCount = 0;
    let confirmedCount = 0;
    let inConsultationCount = 0;
    let completedCount = 0;
    let cancelledCount = 0;

    allAppointments.forEach((a) => {
      if (a.paymentStatus === "Paid" || a.status === "Completed") {
        totalRevenue += a.fee || 2500;
      }
      const st = a.status.toLowerCase();
      if (st === "pending") pendingCount++;
      else if (st === "confirmed") confirmedCount++;
      else if (st === "in consultation") inConsultationCount++;
      else if (st === "completed") completedCount++;
      else if (st === "cancelled") cancelledCount++;
    });

    // Leads summary
    const allLeads = await db.select().from(leads).orderBy(desc(leads.id)).limit(6);
    const newLeadsCount = allLeads.filter((l) => l.status === "New").length;
    const convertedLeadsCount = allLeads.filter((l) => l.status === "Converted").length;

    // Specialty distribution
    const specialtyMap: Record<string, number> = {};
    allAppointments.forEach((a) => {
      const spec = a.doctorSpecialty || "General Medicine";
      specialtyMap[spec] = (specialtyMap[spec] || 0) + 1;
    });

    const specialtyDistribution = Object.entries(specialtyMap).map(([name, count]) => ({
      name,
      count,
    }));

    // ── Charts data for overview ─────────────────────────────────────
    // Patient registrations per ISO date (last 14 days)
    const patientSeries = await db
      .select({ day: sql<string>`to_char(created_at, 'YYYY-MM-DD')`, count: sql<number>`count(*)` })
      .from(patients)
      .groupBy(sql`to_char(created_at, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(created_at, 'YYYY-MM-DD')`);

    // Appointment type distribution (visit types) for donut chart
    const visitTypeMap: Record<string, number> = {};
    allAppointments.forEach((a) => {
      const t = (a as any).visitType || "New Consultation";
      visitTypeMap[t] = (visitTypeMap[t] || 0) + 1;
    });
    const appointmentTypeDistribution = Object.entries(visitTypeMap).map(([name, count]) => ({
      name,
      count,
    }));

    return NextResponse.json({
      stats: {
        totalPatients: Number(patientCountRes?.count || 0),
        totalAppointments: Number(appointmentCountRes?.count || 0),
        todayAppointmentsCount: todayAppointments.length,
        pendingAppointmentsCount: pendingCount,
        confirmedAppointmentsCount: confirmedCount,
        inConsultationCount: inConsultationCount,
        completedAppointmentsCount: completedCount,
        cancelledAppointmentsCount: cancelledCount,
        totalRevenue,
        totalDoctors: Number(doctorCountRes?.count || 0),
        totalServices: Number(serviceCountRes?.count || 0),
        totalLeads: Number(leadCountRes?.count || 0),
        newLeadsCount,
        convertedLeadsCount,
        totalReviews: Number(reviewCountRes?.count || 0),
      },
      todaySchedule: todayAppointments.slice(0, 10),
      recentAppointments: allAppointments.slice(0, 8),
      recentLeads: allLeads,
      specialtyDistribution,
      patientSeries,
      appointmentTypeDistribution,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}
