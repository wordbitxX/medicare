"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MessageCircle,
  Activity,
  ChevronDown,
  Info,
  ArrowRight,
  Stethoscope,
  HeartPulse,
  Sparkles,
  Baby,
  Eye,
  Dumbbell,
  Scissors,
  TestTube,
  Smile,
} from "lucide-react";
import { ServiceType, ClinicSettingsType } from "@/types";
import { buildWhatsAppLink, defaultWhatsAppMessages } from "@/lib/whatsapp";

interface ServicesSectionProps {
  services: ServiceType[];
  settings: ClinicSettingsType;
  onSelectServiceToBook: (serviceId: number) => void;
}

const ICONS: Record<string, { icon: any; bg: string; color: string }> = {
  "General Medicine": { icon: Stethoscope, bg: "bg-teal-50", color: "text-teal-700" },
  "Dental Care": { icon: Smile, bg: "bg-sky-50", color: "text-sky-700" },
  "Dermatology": { icon: Sparkles, bg: "bg-pink-50", color: "text-pink-700" },
  "Cardiology": { icon: HeartPulse, bg: "bg-rose-50", color: "text-rose-700" },
  "Pediatrics": { icon: Baby, bg: "bg-amber-50", color: "text-amber-700" },
  "Ophthalmology": { icon: Eye, bg: "bg-indigo-50", color: "text-indigo-700" },
  "Physiotherapy": { icon: Dumbbell, bg: "bg-emerald-50", color: "text-emerald-700" },
  "General Surgery": { icon: Scissors, bg: "bg-purple-50", color: "text-purple-700" },
  "Diagnostics": { icon: TestTube, bg: "bg-cyan-50", color: "text-cyan-700" },
};

function getIconStyle(category: string) {
  for (const [key, value] of Object.entries(ICONS)) {
    if (category.toLowerCase().includes(key.toLowerCase())) return value;
  }
  return { icon: Activity, bg: "bg-slate-50", color: "text-slate-700" };
}

export default function ServicesSection({ services, settings, onSelectServiceToBook }: ServicesSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedPrepId, setExpandedPrepId] = useState<number | null>(null);

  const categories = ["All", ...Array.from(new Set(services.map((s) => s.category)))];
  const filteredServices = selectedCategory === "All" ? services : services.filter((s) => s.category === selectedCategory);
  const servicesCountForDisplay = services.length;

  return (
    <section id="services" className="border-b border-slate-200 bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            Start with the care you need today
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Services & PKR Pricing
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            Duration, preparation guidelines and consultation fee listed for every treatment.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedCategory === cat
                    ? "bg-[#0A2540] text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((service) => {
            const iconStyle = getIconStyle(service.category);
            const Icon = iconStyle.icon;
            const waLink = buildWhatsAppLink(settings.whatsapp, defaultWhatsAppMessages.costInquiry(settings.clinicName, service.name));

            return (
              <div
                key={service.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/40 hover:shadow-xl hover:shadow-teal-900/10 hover:ring-2 hover:ring-teal-500/25"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-600 via-emerald-400 to-teal-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconStyle.bg} ${iconStyle.color} transition-transform group-hover:scale-105`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{service.name}</h3>
                    <span className="text-[10px] font-semibold text-slate-400">{service.category}</span>
                  </div>
                </div>

                <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
                  {service.description}
                </p>

                <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
                    <Clock className="h-3 w-3" />
                    {service.durationMinutes} min
                  </span>
                  <span className="ml-auto rounded-xl bg-[#0A2540] px-3 py-1.5 text-sm font-black text-white shadow-sm transition-all duration-300 group-hover:bg-teal-600 group-hover:shadow-teal-600/30">
                    PKR {service.price.toLocaleString()}
                  </span>
                </div>

                {service.preparationInstructions && (
                  <div className="mt-3">
                    <button
                      onClick={() => setExpandedPrepId(expandedPrepId === service.id ? null : service.id)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                    >
                      <ChevronDown className={`w-3 h-3 transition-transform ${expandedPrepId === service.id ? "rotate-180" : ""}`} />
                      Preparation
                    </button>
                    {expandedPrepId === service.id && (
                      <p className="mt-1.5 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600 leading-relaxed">
                        {service.preparationInstructions}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => onSelectServiceToBook(service.id)}
                    className="flex-1 py-2.5 bg-[#0A2540] hover:bg-[#071728] text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Book Service
                  </button>

                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-xs rounded-lg border border-slate-200 flex items-center justify-center gap-1 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Show remaining services — link to full catalog */}
        <div className="mt-10 flex flex-col items-center gap-4">
          {filteredServices.length > 0 && (
            <p className="text-xs font-semibold text-slate-500">
              Showing {filteredServices.length} of {settings ? servicesCountForDisplay : filteredServices.length} services
            </p>
          )}
          <Link
            href="/services"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-teal-500 hover:bg-teal-50 hover:text-teal-800"
          >
            <span>View More Services & Diagnostics</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
