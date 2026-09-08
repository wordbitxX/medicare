import { NextResponse } from "next/server";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = Number(params.id);
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Increment views
    await db
      .update(blogPosts)
      .set({ views: (post.views || 0) + 1 })
      .where(eq(blogPosts.id, id));

    return NextResponse.json(post, { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" } });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = Number(params.id);
    const body = await request.json();

    const [updated] = await db
      .update(blogPosts)
      .set({
        title: body.title,
        category: body.category,
        authorName: body.authorName,
        authorRole: body.authorRole,
        readTime: body.readTime,
        summary: body.summary,
        content: body.content,
        coverImage: body.coverImage !== undefined ? (body.coverImage ? String(body.coverImage).trim() : null) : undefined,
        published: body.published,
      })
      .where(eq(blogPosts.id, id))
      .returning();

    return NextResponse.json({ success: true, post: updated });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = Number(params.id);
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
    return NextResponse.json({ success: true, message: "Blog post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
