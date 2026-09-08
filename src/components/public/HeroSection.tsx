"use client";

import React from "react";
import Image from "next/image";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { ClinicSettingsType, DoctorType, ServiceType } from "@/types";
import { buildWhatsAppLink, defaultWhatsAppMessages } from "@/lib/whatsapp";

interface HeroSectionProps {
  settings: ClinicSettingsType;
  doctors: DoctorType[];
  services: ServiceType[];
  onOpenBooking: () => void;
  onSelectDoctorToBook: (docId: number) => void;
  onSwitchPreset: (presetKey: string) => Promise<void>;
}

export default function HeroSection({ settings, doctors, services, onOpenBooking }: HeroSectionProps) {
  const heroWaLink = buildWhatsAppLink(
    settings.whatsapp,
    defaultWhatsAppMessages.book(settings.clinicName)
  );

  return (
    <section className="relative overflow-hidden bg-[#061524] text-white">
      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "30px 30px",
        }}
      />
      <div className="liquid-blob-slow absolute -left-40 top-0 h-[32rem] w-[32rem] bg-teal-500/12 blur-[90px]" />
      <div className="liquid-blob absolute -right-32 bottom-0 h-[28rem] w-[28rem] bg-emerald-400/12 blur-[90px]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white/5 to-transparent" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-[1.02fr_.98fr] lg:gap-14 lg:px-8 lg:py-24">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Private OPD · Same-day booking · WhatsApp support
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.06] tracking-[-0.045em] text-white md:text-5xl lg:text-[3.7rem]">
            Premium specialist care,
            <span className="block bg-gradient-to-r from-teal-200 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
              without the hospital wait.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-[15px] leading-7 text-slate-300 md:text-base">
            Book PMDC-registered consultants, OPD checkups, executive evening clinics and video
            consultations with clear PKR fees and a verified appointment slip.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onOpenBooking}
              className="btn-press group inline-flex items-center justify-center gap-2 rounded-full bg-[#23c49b] px-7 py-3.5 text-sm font-extrabold text-[#061524] shadow-[0_16px_35px_rgba(35,196,155,0.24)] transition hover:-translate-y-0.5 hover:bg-[#35d4ac]"
            >
              <CalendarDays className="h-4 w-4" />
              Book Appointment
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href={heroWaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-press inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              <MessageCircle className="h-4 w-4 text-emerald-300" />
              Book via WhatsApp
            </a>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "PMDC Verified", text: "Senior consultants" },
              { icon: Clock3, title: "Live Slots", text: "Morning + evening" },
              { icon: CheckCircle2, title: "Clear Fees", text: "No hidden charges" },
            ].map((item) => (
              <div key={item.title} className="glass-panel-dark rounded-2xl p-4">
                <item.icon className="h-5 w-5 text-emerald-300" />
                <div className="mt-2 text-sm font-bold text-white">{item.title}</div>
                <div className="text-[11px] text-white/45">{item.text}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[590px] lg:mx-0">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-[0_34px_80px_rgba(0,0,0,0.38)]">
            <div className="relative aspect-[4/4.15] sm:aspect-[5/4.35]">
              <Image
                src="https://images.pexels.com/photos/7653083/pexels-photo-7653083.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1000"
                alt="Consultant doctor explaining treatment to a family in a modern clinic"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 47vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#061524]/80 via-transparent to-transparent" />
            </div>

            <div className="absolute left-4 top-4 rounded-2xl border border-white/20 bg-white/95 p-3 text-[#061524] shadow-xl backdrop-blur">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <Stethoscope className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Consultants</div>
                  <div className="text-lg font-black leading-none">{doctors.length}+</div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 rounded-3xl border border-white/15 bg-[#061524]/90 p-4 shadow-xl backdrop-blur-md sm:p-5">
              <div className="grid grid-cols-3 divide-x divide-white/10 text-center">
                <div>
                  <div className="text-xl font-black text-white">{doctors.length}+</div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-white/45">Doctors</div>
                </div>
                <div>
                  <div className="text-xl font-black text-white">{services.length}+</div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-white/45">Services</div>
                </div>
                <div>
                  <div className="text-xl font-black text-white">4.9</div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-white/45">Rating</div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-5 -right-2 hidden rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-2xl sm:block lg:-right-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Next step</div>
                <div className="text-xs font-extrabold text-slate-900">Choose shift & consultant</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
