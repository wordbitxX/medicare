"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { BlogPostType, ClinicSettingsType } from "@/types";

interface BlogSectionProps {
  initialPosts: BlogPostType[];
  settings: ClinicSettingsType;
  onOpenBooking: () => void;
}

export default function BlogSection({ initialPosts }: BlogSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = ["All", ...Array.from(new Set(initialPosts.map((post) => post.category)))];
  const filteredPosts =
    selectedCategory === "All"
      ? initialPosts
      : initialPosts.filter((post) => post.category === selectedCategory);

  return (
    <section id="blog" className="border-b border-slate-200 bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-bold text-teal-800">
            <BookOpen className="h-3.5 w-3.5" />
            Doctor-authored health insights
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Clinical health guides for Pakistani families
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            Evidence-based guidance written by our consultants across heart health, diabetes,
            dentistry, dermatology, pediatrics and rehabilitation.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  selectedCategory === category
                    ? "bg-[#0a2942] text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block h-full">
              <article className="flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition duration-300 group-hover:-translate-y-1 group-hover:border-teal-300 group-hover:shadow-lg">
                {post.coverImage && (
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://images.pexels.com/photos/7653083/pexels-photo-7653083.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=760";
                      }}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 to-transparent" />
                    <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-teal-800 shadow-sm">
                      {post.category}
                    </span>
                  </div>
                )}
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between gap-3 text-xs">
                    {!post.coverImage && (
                      <span className="rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-teal-800">
                        {post.category}
                      </span>
                    )}
                    <span className="ml-auto flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-900 transition group-hover:text-teal-700">
                    {post.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-xs leading-6 text-slate-600">
                    {post.summary}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-slate-100 px-6 py-4">
                  <div>
                    <div className="text-[11px] font-bold text-slate-800">{post.authorName}</div>
                    <div className="mt-0.5 text-[10px] text-slate-400">
                      {post.authorRole || "Medical Specialist"}
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-teal-700">
                    Read guide
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
