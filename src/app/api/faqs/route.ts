import { NextResponse } from "next/server";
import { publicCacheHeaders } from "@/lib/cache";
import { db } from "@/db";
import { faqs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get("all") === "true";

    let results;
    if (includeAll) {
      results = await db.select().from(faqs).orderBy(faqs.orderNumber, faqs.id);
    } else {
      results = await db
        .select()
        .from(faqs)
        .where(eq(faqs.active, true))
        .orderBy(faqs.orderNumber, faqs.id);
    }

    return NextResponse.json(results, { headers: includeAll ? { "Cache-Control": "private, no-store" } : publicCacheHeaders() });
  } catch (error) {
    console.error("Error fetching faqs:", error);
    return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, answer, category, orderNumber } = body;

    if (!question || !answer) {
      return NextResponse.json({ error: "Question and answer are required" }, { status: 400 });
    }

    const [created] = await db
      .insert(faqs)
      .values({
        question: question.trim(),
        answer: answer.trim(),
        category: category || "General",
        orderNumber: Number(orderNumber) || 1,
        active: true,
      })
      .returning();

    return NextResponse.json({ success: true, faq: created });
  } catch (error) {
    console.error("Error creating faq:", error);
    return NextResponse.json({ error: "Failed to create FAQ" }, { status: 500 });
  }
}
