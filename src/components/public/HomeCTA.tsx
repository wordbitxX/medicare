"use client";

import React from "react";
import { ArrowRight, Calendar, MessageCircle } from "lucide-react";
import { ClinicSettingsType } from "@/types";
import { buildWhatsAppLink, defaultWhatsAppMessages } from "@/lib/whatsapp";

interface HomeCTAProps {
  settings: ClinicSettingsType;
  onOpenBooking: () => void;
}

export default function HomeCTA({ settings, onOpenBooking }: HomeCTAProps) {
  const whatsappLink = buildWhatsAppLink(
    settings.whatsapp,
    defaultWhatsAppMessages.book(settings.clinicName)
  );

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#0b1e31] px-6 py-12 text-white shadow-xl sm:px-10 md:py-16 lg:px-16">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="absolute -right-16 -top-24 h-80 w-80 rounded-full bg-emerald-500/15 blur-[90px]" />

          <div className="relative z-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                Same-day appointments available
              </div>
              <h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                Book your consultation today — most slots confirm within the hour.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/55">
                Choose a department, pick your consultant and receive an instant appointment reference.
                Prefer chat? Our reception team is available on WhatsApp.
              </p>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto">
              <button
                onClick={onOpenBooking}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
              >
                <Calendar className="h-4 w-4" />
                Book Appointment
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4" />
                Book via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
