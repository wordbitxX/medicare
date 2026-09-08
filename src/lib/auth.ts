import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface AuthSession {
  id: number;
  name: string;
  email: string;
  role: "super_admin" | "receptionist" | "doctor";
  doctorId?: number | null;
}

const SESSION_COOKIE_NAME = "clinic_session";

export async function createSession(user: AuthSession) {
  const cookieStore = await cookies();
  const sessionData = JSON.stringify(user);
  const encoded = Buffer.from(sessionData).toString("base64");
  
  cookieStore.set(SESSION_COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!cookie?.value) return null;

    const decoded = Buffer.from(cookie.value, "base64").toString("utf-8");
    const session = JSON.parse(decoded) as AuthSession;
    return session;
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function verifyUserCredentials(email: string, pass: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const [foundUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (!foundUser) return null;

  // Verify password (plain check for demo accounts or standard)
  if (foundUser.password === pass) {
    return {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role as "super_admin" | "receptionist" | "doctor",
      doctorId: foundUser.doctorId,
    };
  }

  return null;
}
