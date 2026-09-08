import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import PublicArticlePage from "@/components/public/PublicArticlePage";
import { getPublicClinicData } from "@/lib/clinic-data";

export const dynamic = "force-dynamic";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://medicareplus.pk").replace(/\/$/, "");

const getPublishedPost = cache(async (slug: string) => {
  const [post] = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true)))
    .limit(1);
  return post ?? null;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return { title: "Article Not Found" };

  return {
    title: post.title,
    description: post.summary,
    keywords: [
      post.category,
      `${post.category} Lahore`,
      `${post.category} doctor advice Pakistan`,
      "Medicare Plus health guide",
    ],
    authors: [{ name: post.authorName }],
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      url: `/blog/${post.slug}`,
      title: post.title,
      description: post.summary,
      authors: [post.authorName],
      section: post.category,
      publishedTime: post.createdAt?.toISOString(),
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();

  await db
    .update(blogPosts)
    .set({ views: (post.views || 0) + 1 })
    .where(eq(blogPosts.id, post.id));

  const data = await getPublicClinicData();
  const publicPost = data.blogPosts.find((item) => item.id === post.id || item.slug === post.slug);
  const displayPost = {
    ...post,
    coverImage: post.coverImage || publicPost?.coverImage || null,
  };
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    articleSection: post.category,
    datePublished: post.createdAt?.toISOString(),
    dateModified: post.createdAt?.toISOString(),
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
    author: {
      "@type": "Physician",
      name: post.authorName,
      jobTitle: post.authorRole,
    },
    publisher: {
      "@type": "MedicalClinic",
      name: data.settings.clinicName,
      url: siteUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema).replace(/</g, "\\u003c") }}
      />
      <PublicArticlePage
        post={{ ...displayPost, views: (post.views || 0) + 1 }}
        settings={data.settings}
        doctors={data.doctors}
        services={data.services}
      />
    </>
  );
}
