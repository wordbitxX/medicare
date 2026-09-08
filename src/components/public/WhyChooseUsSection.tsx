"use client";

import React from "react";
import {
  ShieldCheck,
  Clock,
  Award,
  HeartHandshake,
  FileCheck,
  Stethoscope,
  Microscope,
  Sparkles,
} from "lucide-react";

export default function WhyChooseUsSection() {
  const features = [
    {
      icon: Award,
      title: "Board-Certified Specialists Only",
      description:
        "Every doctor holds post-graduate fellowships (FCPS, MRCP, FRCS, RDS) with 8+ years of clinical excellence in Pakistan and abroad.",
    },
    {
      icon: Clock,
      title: "Zero Waiting Room Queue",
      description:
        "Digital scheduling ensures your appointment starts within 10 minutes of your allocated time slot. Priority walk-in triage available.",
    },
    {
      icon: ShieldCheck,
      title: "Hospital-Grade Autoclave Sterilization",
      description:
        "Class-B European autoclave sterilization for all dental, surgical, and aesthetic instruments, eliminating any infection risk.",
    },
    {
      icon: Microscope,
      title: "Same-Day Diagnostic Labs",
      description:
        "Automated hematology and biochemistry analyzers providing verified lab test results and digital PDF reports on WhatsApp.",
    },
    {
      icon: FileCheck,
      title: "Panel Insurance & Cashless Billing",
      description:
        "Approved cashless hospital panel for Jubilee Life, EFU, Adamjee, State Life, and direct itemized reimbursement claims.",
    },
    {
      icon: HeartHandshake,
      title: "7-Day Free Follow-up Review",
      description:
        "All initial physician and pediatric consultations include a complimentary follow-up evaluation within 7 days for peace of mind.",
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>International Clinical Standards</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Why Patients Choose Medicare Plus
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            We combine world-class medical science with compassionate, transparent patient care to
            deliver superior clinical outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:shadow-xl hover:border-teal-500/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-100/80 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                  {feat.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
