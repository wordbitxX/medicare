import { cookies } from "next/headers";
import { db } from "@/db";
import { patientAccounts, otpCodes, patients } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "patient_session";
const SESSION_DURATION_DAYS = 30;

export interface PatientSession {
  accountId: number;
  patientId: number | null;
  phone: string;
  firstName: string;
  lastName: string;
  verified: boolean;
}

// ─── Session helpers ────────────────────────────────────────────────

export async function createPatientSession(session: PatientSession) {
  const cookieStore = await cookies();
  const encoded = Buffer.from(JSON.stringify(session)).toString("base64");
  cookieStore.set(SESSION_COOKIE, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_DURATION_DAYS,
  });
}

export async function getPatientSession(): Promise<PatientSession | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(SESSION_COOKIE);
    if (!cookie?.value) return null;
    const decoded = Buffer.from(cookie.value, "base64").toString("utf-8");
    return JSON.parse(decoded) as PatientSession;
  } catch {
    return null;
  }
}

export async function clearPatientSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// ─── OTP helpers ────────────────────────────────────────────────────

/** 
 * Generates a 6-digit OTP and persists it.
 * In a real deployment replace the console.log with an SMS gateway call.
 */
export async function generateAndStoreOtp(
  phone: string,
  purpose: "signup" | "login"
): Promise<string> {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Burn any older unused codes first so only the newest code works.
  await invalidatePreviousOtps(phone, purpose);

  await db.insert(otpCodes).values({
    phone,
    code,
    purpose,
    expiresAt,
    used: false,
  });

  // ── In production replace this with your SMS provider ──────────────
  console.log(`[OTP] Phone: ${phone} | Code: ${code} | Purpose: ${purpose}`);
  // ───────────────────────────────────────────────────────────────────

  return code;
}

export async function verifyOtp(
  phone: string,
  code: string,
  purpose: "signup" | "login"
): Promise<boolean> {
  const status = await checkOtpValidity(phone, code, purpose);
  if (status !== "valid") return false;

  const now = new Date();
  const [otp] = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.phone, phone),
        eq(otpCodes.code, code),
        eq(otpCodes.purpose, purpose),
        eq(otpCodes.used, false),
        gt(otpCodes.expiresAt, now)
      )
    )
    .limit(1);

  if (!otp) return false;

  await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, otp.id));
  return true;
}

/**
 * Non-consuming OTP check — tells the UI exactly WHY a code fails
 * ("wrong" vs "expired" vs "already used") without burning the code.
 */
export async function checkOtpValidity(
  phone: string,
  code: string,
  purpose: "signup" | "login"
): Promise<"valid" | "wrong" | "expired" | "used"> {
  const [otp] = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.phone, phone),
        eq(otpCodes.code, code),
        eq(otpCodes.purpose, purpose)
      )
    )
    .limit(1);

  if (!otp) return "wrong";
  if (otp.used) return "used";
  if (new Date(otp.expiresAt).getTime() < Date.now()) return "expired";
  return "valid";
}

/** Invalidate older unused codes so only the newest OTP works. */
export async function invalidatePreviousOtps(
  phone: string,
  purpose: "signup" | "login"
): Promise<void> {
  await db
    .update(otpCodes)
    .set({ used: true })
    .where(
      and(
        eq(otpCodes.phone, phone),
        eq(otpCodes.purpose, purpose),
        eq(otpCodes.used, false)
      )
    );
}

// ─── Password helpers ───────────────────────────────────────────────

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ─── Account helpers ────────────────────────────────────────────────

export async function getPatientAccountByPhone(phone: string) {
  const [account] = await db
    .select()
    .from(patientAccounts)
    .where(eq(patientAccounts.phone, phone.trim()))
    .limit(1);
  return account || null;
}

export async function linkPatientRecord(accountId: number, phone: string, cnic?: string | null) {
  // Find matching patient record by phone first, then CNIC
  let [patient] = await db
    .select()
    .from(patients)
    .where(eq(patients.phone, phone))
    .limit(1);

  if (!patient && cnic) {
    [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.cnic, cnic))
      .limit(1);
  }

  if (patient) {
    await db
      .update(patientAccounts)
      .set({ patientId: patient.id, updatedAt: new Date() })
      .where(eq(patientAccounts.id, accountId));
    return patient.id;
  }
  return null;
}
