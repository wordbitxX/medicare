import { NextResponse } from "next/server";
import {
  createPatientSession,
  getPatientAccountByPhone,
  verifyOtp,
  comparePassword,
} from "@/lib/patient-auth";
import { normalisePhone } from "@/lib/phone";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { otp, password } = body;
    const phone = body.phone ? normalisePhone(String(body.phone)) : "";

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required." },
        { status: 400 }
      );
    }

    // ── Path 1: OTP login ──────────────────────────────────────────
    if (otp) {
      const valid = await verifyOtp(phone, String(otp), "login");
      if (!valid) {
        return NextResponse.json(
          { error: "Invalid or expired OTP. Please request a new code." },
          { status: 400 }
        );
      }
    }
    // ── Path 2: Password login (no OTP needed) ─────────────────────
    else if (password) {
      const account = await getPatientAccountByPhone(phone);
      if (!account || !account.active) {
        return NextResponse.json(
          { error: "Account not found or disabled." },
          { status: 401 }
        );
      }
      if (!account.passwordHash) {
        return NextResponse.json(
          { error: "No password set on this account. Please login with OTP instead." },
          { status: 400 }
        );
      }
      const ok = await comparePassword(String(password), account.passwordHash);
      if (!ok) {
        return NextResponse.json(
          { error: "Incorrect password. Please try again." },
          { status: 401 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "OTP or password is required." },
        { status: 400 }
      );
    }

    const account = await getPatientAccountByPhone(phone);
    if (!account || !account.active) {
      return NextResponse.json(
        { error: "Account not found or disabled." },
        { status: 401 }
      );
    }

    await createPatientSession({
      accountId: account.id,
      patientId: account.patientId,
      phone: account.phone,
      firstName: account.firstName,
      lastName: account.lastName,
      verified: account.verified,
    });

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        phone: account.phone,
        firstName: account.firstName,
        lastName: account.lastName,
      },
    });
  } catch (err) {
    console.error("login error:", err);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
