"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Clock, Stethoscope } from "lucide-react";
import { BlogPostType } from "@/types";

interface HomeBlogPreviewProps {
  posts: BlogPostType[];
}

export default function HomeBlogPreview({ posts }: HomeBlogPreviewProps) {
  if (posts.length === 0) return null;

  return (
    <section className="border-b border-slate-200 bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Latest Health &amp; Medical Guides
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Evidence-based clinical articles
            </h2>
          </div>
          <Link
            href="/blog"
            className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-slate-600 transition hover:text-slate-900"
          >
            Explore all articles
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0, 3).map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:shadow-lg hover:border-slate-300"
            >
              {post.coverImage ? (
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://images.pexels.com/photos/7653083/pexels-photo-7653083.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=760";
                    }}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" />
                  <span className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#0A2540] shadow-xs">
                    {post.category}
                  </span>
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center bg-slate-50 text-slate-300">
                  <Stethoscope className="h-12 w-12" />
                </div>
              )}

              <div className="p-5">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <Clock className="h-3 w-3" />
                  {post.readTime}
                  <span className="text-slate-300">·</span>
                  <span>{post.authorName}</span>
                </div>
                <h3 className="mt-2 line-clamp-2 text-sm font-bold text-slate-900 transition group-hover:text-slate-700">
                  {post.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
                  {post.summary}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
