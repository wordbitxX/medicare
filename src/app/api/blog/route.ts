import { NextResponse } from "next/server";
import { publicCacheHeaders } from "@/lib/cache";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get("all") === "true";
    const category = searchParams.get("category");

    const filters = [];
    if (!includeAll) filters.push(eq(blogPosts.published, true));
    if (category && category !== "All") filters.push(eq(blogPosts.category, category));

    const results = await db
      .select()
      .from(blogPosts)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(blogPosts.id));

    return NextResponse.json(results, {
      headers: includeAll ? { "Cache-Control": "private, no-store" } : publicCacheHeaders(),
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, authorName, authorRole, readTime, summary, content, published, coverImage } = body;

    if (!title || !category || !content) {
      return NextResponse.json({ error: "Title, category, and content are required" }, { status: 400 });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") + `-${Date.now().toString().slice(-4)}`;

    const [created] = await db
      .insert(blogPosts)
      .values({
        slug,
        title: title.trim(),
        category: category.trim(),
        authorName: authorName ? authorName.trim() : "Medical Team",
        authorRole: authorRole || "Consultant Physician",
        readTime: readTime || "4 min read",
        summary: summary || title,
        content: content.trim(),
        coverImage: coverImage ? String(coverImage).trim() : null,
        published: published !== undefined ? published : true,
      })
      .returning();

    return NextResponse.json({ success: true, post: created });
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 });
  }
}
