"use client";

import React from "react";
import { ArrowRight, Code2, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { WORDBITX, getWordbitxWhatsAppLink } from "@/lib/wordbitx";

interface WordbitxBandProps {
  clinicName?: string;
  heading?: string;
  description?: string;
}

/**
 * Compact WordbitX branding + contact band used on interior pages
 * (About, Contact) so every page routes "build me this" inquiries
 * to WordbitX Software Company.
 */
export default function WordbitxBand({
  clinicName,
  heading = "Need a website & booking system like this for your own clinic?",
  description = "This entire platform — public website, online appointment booking, patient CRM and multi-role admin dashboard — is a commercial product by WordbitX Software Company, customizable for any clinic or hospital in Pakistan.",
}: WordbitxBandProps) {
  const waLink = getWordbitxWhatsAppLink(clinicName);

  return (
    <section className="border-y border-slate-800 bg-[#071728] py-14 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-400/25 bg-blue-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-300">
              <Code2 className="h-3 w-3" /> {WORDBITX.companyName}
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">{heading}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55">{description}</p>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-press inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-500"
              >
                <MessageCircle className="h-4 w-4" />
                Discuss Your Project
              </a>
              <a
                href={WORDBITX.website}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-press inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.06] px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                wordbitxtech.com
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300">
              Contact WordbitX
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-blue-400" />
                <a href={WORDBITX.phoneHref} className="text-white/80 transition hover:text-white">
                  {WORDBITX.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                <a
                  href={WORDBITX.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 transition hover:text-white"
                >
                  WhatsApp / Call
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-blue-400" />
                <a href={WORDBITX.emailHref} className="text-white/80 transition hover:text-white">
                  {WORDBITX.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-blue-400" />
                <span className="text-white/70">{WORDBITX.headOffice}</span>
              </li>
            </ul>
            <p className="mt-5 border-t border-white/10 pt-4 text-[11px] leading-relaxed text-white/45">
              {WORDBITX.tagline}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
