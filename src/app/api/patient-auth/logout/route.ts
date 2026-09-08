import { NextResponse } from "next/server";
import { clearPatientSession } from "@/lib/patient-auth";

export async function POST() {
  await clearPatientSession();
  return NextResponse.json({ success: true });
}
