import { NextResponse } from "next/server";
import { db } from "@/db";
import { patientAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getPatientSession, hashPassword } from "@/lib/patient-auth";

export async function PUT(request: Request) {
  try {
    const session = await getPatientSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const body = await request.json();

    const updateData: Record<string, any> = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email || null,
      cnic: body.cnic || null,
      gender: body.gender,
      dateOfBirth: body.dateOfBirth || null,
      bloodGroup: body.bloodGroup || null,
      city: body.city || "Lahore",
      address: body.address || null,
      emergencyContact: body.emergencyContact || null,
      allergies: body.allergies || null,
      updatedAt: new Date(),
    };

    if (body.newPassword && body.newPassword.length >= 6) {
      updateData.passwordHash = await hashPassword(body.newPassword);
    }

    const [updated] = await db
      .update(patientAccounts)
      .set(updateData)
      .where(eq(patientAccounts.id, session.accountId))
      .returning();

    return NextResponse.json({
      success: true,
      account: {
        id: updated.id,
        firstName: updated.firstName,
        lastName: updated.lastName,
        phone: updated.phone,
      },
    });
  } catch (err: any) {
    console.error("update profile error:", err);
    const pgCode = err?.code || err?.cause?.code;
    if (pgCode === "23505") {
      return NextResponse.json(
        { error: "This CNIC or email is already registered with another account." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
