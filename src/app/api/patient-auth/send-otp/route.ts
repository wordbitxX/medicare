import { NextResponse } from "next/server";
import { generateAndStoreOtp, getPatientAccountByPhone } from "@/lib/patient-auth";
import { sendOtpViaGateway } from "@/lib/otp-sender";
import { normalisePhone } from "@/lib/phone";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawPhone = String(body.phone || "").trim();
    const purpose: "signup" | "login" = body.purpose === "login" ? "login" : "signup";

    if (!rawPhone) {
      return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
    }

    const phone = normalisePhone(rawPhone);
    const existing = await getPatientAccountByPhone(phone);

    if (purpose === "signup" && existing) {
      return NextResponse.json(
        { error: "An account already exists for this number. Please log in instead." },
        { status: 409 }
      );
    }

    if (purpose === "login" && !existing) {
      return NextResponse.json(
        { error: "No account found for this number. Please sign up first." },
        { status: 404 }
      );
    }

    const code = await generateAndStoreOtp(phone, purpose);

    // Try real delivery first (WhatsApp → Twilio SMS → custom webhook).
    // Falls back to on-screen demo mode when no provider is configured.
    const delivery = await sendOtpViaGateway(phone, code, purpose);

    return NextResponse.json({
      success: true,
      phone,
      message: delivery.sent
        ? delivery.channel === "whatsapp"
          ? `OTP sent to your WhatsApp. Valid for 10 minutes.`
          : `OTP sent via SMS. Valid for 10 minutes.`
        : `OTP sent. Valid for 10 minutes.`,
      delivered: delivery.sent,
      channel: delivery.channel || null,
      // Demo fallback: expose the code so testing works without an SMS gateway.
      // Automatically omitted once a real provider is configured and succeeds.
      ...(delivery.sent ? {} : { otp: code }),
    });
  } catch (err) {
    console.error("send-otp error:", err);
    return NextResponse.json({ error: "Failed to send OTP." }, { status: 500 });
  }
}
