import { NextResponse } from "next/server";
import { db } from "@/db";
import { patients } from "@/db/schema";
import { eq, inArray, or } from "drizzle-orm";
import { phoneVariants } from "@/lib/phone";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone")?.trim();
    const cnic = searchParams.get("cnic")?.trim();

    if (!phone && !cnic) {
      return NextResponse.json({ found: false, patient: null });
    }

    const conditions = [] as Array<ReturnType<typeof eq> | ReturnType<typeof inArray>>;
    if (phone) {
      // Match any stored format: 03XXXXXXXXX, 923XXXXXXXXX, 3XXXXXXXXX
      conditions.push(inArray(patients.phone, phoneVariants(phone)));
    }
    if (cnic) conditions.push(eq(patients.cnic, cnic));

    const [patient] = await db
      .select()
      .from(patients)
      .where(conditions.length === 1 ? conditions[0] : or(...conditions))
      .limit(1);

    return NextResponse.json({ found: Boolean(patient), patient: patient || null });
  } catch (error) {
    console.error("Error looking up patient:", error);
    return NextResponse.json({ error: "Failed to look up patient" }, { status: 500 });
  }
}
