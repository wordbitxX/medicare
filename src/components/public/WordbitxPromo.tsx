"use client";

import React from "react";
import {
  ArrowRight,
  Code2,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { WORDBITX, getWordbitxWhatsAppLink } from "@/lib/wordbitx";

interface WordbitxPromoProps {
  clinicName?: string;
}

export default function WordbitxPromo({ clinicName }: WordbitxPromoProps) {
  const waLink = getWordbitxWhatsAppLink(clinicName);

  return (
    <section className="bg-white py-16 md:py-24 border-t border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#071728] p-8 sm:p-12 md:p-16 text-white shadow-2xl">
          <div className="liquid-blob-slow pointer-events-none absolute -left-24 -top-24 h-80 w-80 bg-teal-500/10" />
          <div className="liquid-blob pointer-events-none absolute -right-20 bottom-0 h-72 w-72 bg-emerald-400/10" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative z-10 grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-300">
                <Code2 className="h-3.5 w-3.5" />
                Commercial SaaS Platform by {WORDBITX.companyName}
              </div>

              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl md:text-[2.6rem] md:leading-tight">
                Want to launch a customized clinic or hospital portal like this?
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
                {WORDBITX.companyName} builds and licenses high-performance healthcare platforms,
                patient portals, appointment schedulers and enterprise multi-role admin CRMs for medical
                practices across Pakistan and worldwide.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-press inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-7 py-3.5 text-sm font-bold text-slate-950 shadow-lg transition hover:bg-emerald-400"
                >
                  <MessageCircle className="h-4 w-4" />
                  Contact WordbitX Team
                </a>
                <a
                  href={WORDBITX.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-press inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  <Globe className="h-4 w-4 text-teal-300" />
                  wordbitxtech.com
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md sm:p-8">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500 text-slate-950 font-black text-lg">
                  W
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{WORDBITX.companyName}</h3>
                  <p className="text-[11px] text-teal-300">Engineering &amp; Product Partner</p>
                </div>
              </div>

              <ul className="mt-5 space-y-3.5 text-xs text-white/80">
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 shrink-0 text-teal-400" />
                  <a href={WORDBITX.phoneHref} className="transition hover:text-white">
                    {WORDBITX.phone}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <MessageCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                  <a
                    href={WORDBITX.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-white"
                  >
                    WhatsApp / Direct Call
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 shrink-0 text-teal-400" />
                  <a href={WORDBITX.emailHref} className="transition hover:text-white">
                    {WORDBITX.email}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 shrink-0 text-teal-400" />
                  <span className="text-white/60">{WORDBITX.headOffice}</span>
                </li>
              </ul>

              <div className="mt-6 border-t border-white/10 pt-4 text-[11px] leading-relaxed text-white/45">
                Full source-code ownership · Custom branding · Integrated WhatsApp &amp; SMS gateways.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
