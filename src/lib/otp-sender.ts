/**
 * Real OTP delivery hook.
 *
 * Order of attempts:
 *  1. WhatsApp Cloud API (Meta) — needs WHATSAPP_TOKEN + WHATSAPP_PHONE_NUMBER_ID
 *  2. Twilio SMS             — needs TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_FROM
 *  3. Generic SMS webhook    — needs OTP_WEBHOOK_URL (POSTs { phone, code, purpose })
 *
 * If none are configured, returns { sent: false } and the caller falls back
 * to on-screen demo mode so testing is never blocked.
 */

interface SendResult {
  sent: boolean;
  channel?: "whatsapp" | "sms" | "webhook";
  error?: string;
}

export async function sendOtpViaGateway(
  phone: string,
  code: string,
  purpose: "signup" | "login"
): Promise<SendResult> {
  const message = `Your clinic verification code is ${code}. It expires in 10 minutes. Do not share it with anyone.`;

  // ── 1. WhatsApp Cloud API ──────────────────────────────────────────
  const waToken = process.env.WHATSAPP_TOKEN;
  const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (waToken && waPhoneId) {
    try {
      // WhatsApp requires E.164 without '+'
      const to = phone.replace(/\D/g, "");
      const res = await fetch(`https://graph.facebook.com/v21.0/${waPhoneId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${waToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: message },
        }),
      });
      if (res.ok) return { sent: true, channel: "whatsapp" };
      const errText = await res.text().catch(() => "");
      console.error("[otp-sender] WhatsApp failed:", res.status, errText.slice(0, 300));
    } catch (err) {
      console.error("[otp-sender] WhatsApp error:", err);
    }
  }

  // ── 2. Twilio SMS ──────────────────────────────────────────────────
  const twSid = process.env.TWILIO_ACCOUNT_SID;
  const twToken = process.env.TWILIO_AUTH_TOKEN;
  const twFrom = process.env.TWILIO_FROM;
  if (twSid && twToken && twFrom) {
    try {
      const to = phone.startsWith("+") ? phone : `+${phone}`;
      const params = new URLSearchParams({ To: to, From: twFrom, Body: message });
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`${twSid}:${twToken}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        }
      );
      if (res.ok) return { sent: true, channel: "sms" };
      const errText = await res.text().catch(() => "");
      console.error("[otp-sender] Twilio failed:", res.status, errText.slice(0, 300));
    } catch (err) {
      console.error("[otp-sender] Twilio error:", err);
    }
  }

  // ── 3. Generic webhook (Jazz / Telenor / local SMS panel) ──────────
  const webhook = process.env.OTP_WEBHOOK_URL;
  if (webhook) {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (process.env.OTP_WEBHOOK_TOKEN) {
        headers.Authorization = `Bearer ${process.env.OTP_WEBHOOK_TOKEN}`;
      }
      const res = await fetch(webhook, {
        method: "POST",
        headers,
        body: JSON.stringify({ phone, code, purpose, message }),
      });
      if (res.ok) return { sent: true, channel: "webhook" };
      console.error("[otp-sender] Webhook failed:", res.status);
    } catch (err) {
      console.error("[otp-sender] Webhook error:", err);
    }
  }

  return { sent: false };
}
