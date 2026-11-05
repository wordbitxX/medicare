import type { MetadataRoute } from "next";
import { db } from "@/db";
import { blogPosts, doctors } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SITE_URL as siteUrl } from "@/lib/site";

// Never prerender at build time — the sitemap must not block (or depend on)
// the production build. It is generated at request time instead.
export const dynamic = "force-dynamic";

const CORE_PAGES: MetadataRoute.Sitemap = [
  { url: siteUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
  { url: `${siteUrl}/services`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  { url: `${siteUrl}/doctors`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  { url: `${siteUrl}/book`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${siteUrl}/track`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let articles: MetadataRoute.Sitemap = [];
  let doctorUrls: MetadataRoute.Sitemap = [];

  try {
    const posts = await db
      .select({ slug: blogPosts.slug, updatedAt: blogPosts.createdAt })
      .from(blogPosts)
      .where(eq(blogPosts.published, true));

    articles = posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt || new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    }));
  } catch (err) {
    // Database unavailable at this moment — serve core pages rather than
    // failing the whole sitemap. The error stays visible in server logs.
    console.error("[sitemap] Could not read blog_posts:", err);
  }

  try {
    const activeDoctors = await db
      .select({ id: doctors.id })
      .from(doctors)
      .where(eq(doctors.active, true));

    doctorUrls = activeDoctors.map((d) => ({
      url: `${siteUrl}/doctor/${d.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }));
  } catch (err) {
    console.error("[sitemap] Could not read doctors:", err);
  }

  return [...CORE_PAGES, ...articles, ...doctorUrls];
}
