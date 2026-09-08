import { NextResponse } from "next/server";
import { verifyUserCredentials, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await verifyUserCredentials(email, password);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password. Please use demo credentials." },
        { status: 401 }
      );
    }

    await createSession(user);

    return NextResponse.json({
      success: true,
      user,
      message: `Welcome back, ${user.name}!`,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error during login" },
      { status: 500 }
    );
  }
}
