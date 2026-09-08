"use client";

import React from "react";
import {
  ShieldCheck,
  Clock3,
  HeartPulse,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { ClinicSettingsType } from "@/types";

interface HomeLuxurySectionProps {
  settings: ClinicSettingsType;
  onOpenBooking: () => void;
}

const PURPOSES = [
  {
    icon: ShieldCheck,
    title: "Verified Consultants",
    purpose: "Maqsad: har patient ko PMC-registered specialist mile — koi unqualified staff consultation na kare.",
  },
  {
    icon: Clock3,
    title: "Confirmed Time Slots",
    purpose: "Maqsad: waiting room me ghanton baithna khatam — slot book hote hi time confirm.",
  },
  {
    icon: Wallet,
    title: "Transparent PKR Fees",
    purpose: "Maqsad: fee pehle pata ho, bill baad me surprise na de — har service ka rate published.",
  },
  {
    icon: HeartPulse,
    title: "Continuity of Care",
    purpose: "Maqsad: har visit ka record saved rahe taake agla doctor poori history dekhe.",
  },
];

const GALLERY = [
  {
    src: "https://images.pexels.com/photos/7653083/pexels-photo-7653083.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=800&h=560",
    alt: "Doctor consulting a mother and child in a modern clinic room",
    label: "Family Consultation",
  },
  {
    src: "https://images.pexels.com/photos/5355863/pexels-photo-5355863.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=800&h=560",
    alt: "Modern dental surgery suite with dental chair",
    label: "Dental Suite",
  },
  {
    src: "https://images.pexels.com/photos/33216715/pexels-photo-33216715.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=800&h=560",
    alt: "Digital X-ray imaging room in hospital",
    label: "Digital Imaging",
  },
  {
    src: "https://images.pexels.com/photos/4269274/pexels-photo-4269274.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=800&h=560",
    alt: "Clinic reception desk with friendly staff",
    label: "Reception & Check-in",
  },
  {
    src: "https://images.pexels.com/photos/5619462/pexels-photo-5619462.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=800&h=560",
    alt: "Examination room with treatment couch and equipment",
    label: "Procedure Room",
  },
  {
    src: "https://images.pexels.com/photos/38055771/pexels-photo-38055771.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=800&h=560",
    alt: "Bright modern clinic interior",
    label: "OPD Floor",
  },
];

export default function HomeLuxurySection({ settings, onOpenBooking }: HomeLuxurySectionProps) {
  return (
    <section className="reveal border-b border-slate-200 bg-white py-18 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Everything a modern clinic should be.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            Char bunyadi waday — har box ka maqsad saaf likha hai taake aap ko pata ho ke har
            feature aap ke liye kya karta hai.
          </p>
        </div>

        {/* Purpose boxes */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PURPOSES.map((p) => (
            <div
              key={p.title}
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/40 hover:shadow-lg hover:shadow-teal-900/10"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0A2540] text-teal-300 transition-transform duration-300 group-hover:scale-105">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-extrabold text-slate-900">{p.title}</h3>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{p.purpose}</p>
            </div>
          ))}
        </div>

        {/* Auto-scrolling clinic gallery */}
        <div className="relative mt-12 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 py-6">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />
          <div className="marquee-track flex w-max gap-4 px-4">
            {[...GALLERY, ...GALLERY].map((img, i) => (
              <figure
                key={`${img.label}-${i}`}
                className="relative h-44 w-64 shrink-0 overflow-hidden rounded-2xl border border-slate-200 shadow-sm sm:h-52 sm:w-80"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <figcaption className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/80 to-transparent px-3 pb-2 pt-6 text-[11px] font-bold text-white">
                  {img.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={onOpenBooking}
            className="btn-press inline-flex items-center gap-2 rounded-xl bg-[#0A2540] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#071728]"
          >
            Book Your Visit
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
