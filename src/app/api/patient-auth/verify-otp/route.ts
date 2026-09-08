import { NextResponse } from "next/server";
import { checkOtpValidity } from "@/lib/patient-auth";
import { normalisePhone } from "@/lib/phone";

/**
 * Non-consuming OTP check used by the "Verify & Continue" step.
 * Tells the UI exactly why a code fails WITHOUT burning it,
 * so the real verification still happens at signup/login time.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = body.phone ? normalisePhone(String(body.phone)) : "";
    const code = String(body.otp || body.code || "").trim();
    const purpose: "signup" | "login" = body.purpose === "login" ? "login" : "signup";

    if (!phone || !code) {
      return NextResponse.json(
        { valid: false, reason: "wrong", error: "Please enter the complete 6-digit code." },
        { status: 400 }
      );
    }

    const status = await checkOtpValidity(phone, code, purpose);

    if (status === "valid") {
      return NextResponse.json({ valid: true });
    }

    const messages = {
      wrong: "This code does not match. Please check the code and try again.",
      expired:
        "This code has expired (codes last 10 minutes). Please tap Resend OTP for a fresh code.",
      used: "This code was already used. Please tap Resend OTP for a fresh code.",
    } as const;

    return NextResponse.json(
      { valid: false, reason: status, error: messages[status] },
      { status: 400 }
    );
  } catch (err) {
    console.error("verify-otp error:", err);
    return NextResponse.json(
      { valid: false, reason: "wrong", error: "Could not verify the code. Please try again." },
      { status: 500 }
    );
  }
}
