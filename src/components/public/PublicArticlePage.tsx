"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Eye, MessageCircle, User } from "lucide-react";
import {
  BlogPostType,
  ClinicSettingsType,
  DoctorType,
  ServiceType,
} from "@/types";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { buildWhatsAppLink } from "@/lib/whatsapp";

interface PublicArticlePageProps {
  post: BlogPostType;
  settings: ClinicSettingsType;
  doctors: DoctorType[];
  services: ServiceType[];
}

export default function PublicArticlePage({
  post,
  settings,
  doctors,
  services,
}: PublicArticlePageProps) {
  const shareLink = buildWhatsAppLink(
    settings.whatsapp,
    `Hello ${settings.clinicName}! I read your article "${post.title}" and would like to ask the doctor a question.`
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        settings={settings}
        onOpenBooking={() => { window.location.href = "/book"; }}
        onOpenTracker={() => { window.location.href = "/track"; }}
      />

      <main>
        <section className="bg-[#0b1e31] py-14 text-white md:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-300 hover:text-emerald-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Health Blog
            </Link>
            <div className="mt-6 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-300">
              {post.category}
            </div>
            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
              {post.title}
            </h1>
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-white/55">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {post.authorName}, {post.authorRole}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {post.readTime}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                {post.views} views
              </span>
            </div>
          </div>
        </section>

        <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 md:py-20">
          {post.coverImage && (
            <figure className="mb-10 overflow-hidden rounded-3xl border border-slate-200 shadow-lg">
              <img
                src={post.coverImage}
                alt={post.title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://images.pexels.com/photos/7653083/pexels-photo-7653083.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=760";
                }}
                className="h-64 w-full object-cover sm:h-80 md:h-96"
              />
              <figcaption className="border-t border-slate-100 bg-slate-50 px-5 py-2.5 text-[11px] text-slate-500">
                {post.category} · Reviewed by {post.authorName}
                {post.authorRole ? `, ${post.authorRole}` : ""}
              </figcaption>
            </figure>
          )}

          <p className="rounded-2xl border border-teal-200 bg-teal-50 p-5 text-sm font-medium leading-7 text-teal-950">
            {post.summary}
          </p>
          <div className="mt-8 whitespace-pre-line text-[15px] leading-8 text-slate-700">
            {post.content}
          </div>

          <div className="mt-12 rounded-3xl border border-slate-200 bg-slate-50 p-6 md:p-8">
            <h2 className="text-xl font-semibold text-slate-900">Need personalised clinical advice?</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Articles provide general health education and cannot replace a physical examination.
              Book a consultation with our clinical team for advice tailored to your condition.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => { window.location.href = "/book"; }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700"
              >
                <Calendar className="h-4 w-4" />
                Book a Consultation
              </button>
              <a
                href={shareLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100"
              >
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                Ask on WhatsApp
              </a>
            </div>
          </div>
        </article>
      </main>

      <Footer
        settings={settings}
        onOpenBooking={() => { window.location.href = "/book"; }}
        onOpenTracker={() => { window.location.href = "/track"; }}
      />

    </div>
  );
}
