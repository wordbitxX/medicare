import { NextResponse } from "next/server";
import { db } from "@/db";
import { patientAccounts } from "@/db/schema";
import {
  verifyOtp,
  hashPassword,
  createPatientSession,
  linkPatientRecord,
} from "@/lib/patient-auth";
import { normalisePhone } from "@/lib/phone";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      otp,
      password,
      firstName,
      lastName,
      cnic,
      email,
      gender,
      dateOfBirth,
      bloodGroup,
      city,
      address,
      emergencyContact,
      allergies,
    } = body;
    const phone = body.phone ? normalisePhone(String(body.phone)) : "";

    if (!phone || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Phone, first name and last name are required." },
        { status: 400 }
      );
    }

    if (!password || String(password).length < 6) {
      return NextResponse.json(
        { error: "Please set a password of at least 6 characters so you can sign in later." },
        { status: 400 }
      );
    }

    // OTP is OPTIONAL: if the user enters the on-screen code we mark them
    // verified, otherwise the account is still created (unverified).
    let verified = false;
    if (otp && String(otp).trim().length === 6) {
      verified = await verifyOtp(phone, String(otp).trim(), "signup");
      if (!verified) {
        return NextResponse.json(
          { error: "The OTP code is invalid or expired. Please request a fresh code, or leave the OTP field empty to register without verification." },
          { status: 400 }
        );
      }
    }

    const passwordHash = await hashPassword(String(password));

    const [account] = await db
      .insert(patientAccounts)
      .values({
        phone,
        cnic: cnic || null,
        email: email || null,
        passwordHash,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender: gender || "Male",
        dateOfBirth: dateOfBirth || null,
        bloodGroup: bloodGroup || null,
        city: city || "Lahore",
        address: address || null,
        emergencyContact: emergencyContact || null,
        allergies: allergies || null,
        verified,
        active: true,
      })
      .returning();

    // Try to link to an existing patient CRM record (phone first, then CNIC)
    const patientId = await linkPatientRecord(account.id, phone, cnic || null);

    await createPatientSession({
      accountId: account.id,
      patientId: patientId ?? account.patientId,
      phone: account.phone,
      firstName: account.firstName,
      lastName: account.lastName,
      verified,
    });

    return NextResponse.json({
      success: true,
      verified,
      account: {
        id: account.id,
        phone: account.phone,
        firstName: account.firstName,
        lastName: account.lastName,
      },
    });
  } catch (err: any) {
    console.error("signup error:", err);
    // Drizzle wraps driver errors: code lives on err.cause.code
    const pgCode = err?.code || err?.cause?.code;
    if (pgCode === "23505") {
      return NextResponse.json(
        { error: "An account with this phone, CNIC, or email already exists. Please sign in instead." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Signup failed. Please try again." }, { status: 500 });
  }
}
