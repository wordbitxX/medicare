"use client";

import React, { useState } from "react";
import {
  Stethoscope,
  Heart,
  Sparkles,
  Baby,
  Eye,
  Activity,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Calendar,
  MessageCircle,
} from "lucide-react";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { ClinicSettingsType } from "@/types";

interface DepartmentsSectionProps {
  settings: ClinicSettingsType;
  onOpenBooking: () => void;
}

export default function DepartmentsSection({
  settings,
  onOpenBooking,
}: DepartmentsSectionProps) {
  const [activeDept, setActiveDept] = useState("cardiology");

  const departments = [
    {
      id: "cardiology",
      name: "Cardiology & Heart Care",
      icon: Heart,
      badge: "Critical Specialty",
      tagline: "Preventive Cardiology, 12-Lead ECG & Color Doppler Echocardiography",
      description:
        "Comprehensive diagnosis and non-invasive cardiovascular evaluations by senior interventional cardiologists. From managing refractory hypertension to post-angioplasty rehabilitation.",
      highlights: [
        "Resting 12-Lead Digital ECG with immediate consultant readout",
        "2D Color Doppler Ultrasound Echocardiography",
        "Lipid & Atherosclerosis Risk Stratification",
        "Hypertension and Angina outpatient management",
      ],
      leadDoctor: "Dr. Farhan Malik (FCPS Cardiology)",
      feeText: "PKR 4,000 Consultation",
      image:
        "https://images.pexels.com/photos/15277947/pexels-photo-15277947.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=800",
    },
    {
      id: "dental",
      name: "Modern Dental Surgery",
      icon: Sparkles,
      badge: "Painless Suite",
      tagline: "Motorized Root Canals, Smile Makeovers & 3D Implants",
      description:
        "A boutique dental surgical practice equipped with computer-assisted painless anesthesia, ultrasonic piezocleaning, cosmetic composite veneers, and single-visit root canal therapy.",
      highlights: [
        "100% Painless computerized local anesthesia delivery",
        "Ultrasonic teeth scaling, stain removal & diamond polishing",
        "Single-visit motorized rotary endodontic root canal",
        "Aesthetic tooth-colored composite restorations",
      ],
      leadDoctor: "Dr. Muhammad Bilal (BDS KEMU, C-Implantology)",
      feeText: "PKR 3,000 Consultation",
      image:
        "https://images.pexels.com/photos/5355863/pexels-photo-5355863.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=800",
    },
    {
      id: "derma",
      name: "Clinical Dermatology & Laser",
      icon: Sparkles,
      badge: "FDA Approved",
      tagline: "Medical HydraFacials, Acne Scar Subcision & Melasma Control",
      description:
        "Specialized therapeutic solutions customized for South Asian Fitzpatrick skin types. Medical clearance for hormonal cystic acne, melasma pigmentation, and medical hydrafacials.",
      highlights: [
        "Clinical HydraFacial 7-step medical exfoliation & hydration",
        "Prescription acne subcision & chemical peels",
        "Alopecia, PRP and postpartum hair restoration therapy",
        "Psoriasis, chronic eczema & skin allergy management",
      ],
      leadDoctor: "Dr. Zainab Tariq (FCPS Dermatology)",
      feeText: "PKR 3,500 Consultation",
      image:
        "https://images.pexels.com/photos/5619462/pexels-photo-5619462.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=800",
    },
    {
      id: "medicine",
      name: "Internal & General Medicine",
      icon: Stethoscope,
      badge: "Primary Care",
      tagline: "Preventive Health, Diabetes Reversal & Executive Checkups",
      description:
        "Comprehensive adult health audits, diabetes management, chronic fatigue evaluations, seasonal infectious diseases (Typhoid, Dengue), and whole-family preventative medicine.",
      highlights: [
        "Annual Executive Full-Body Screening packages",
        "HbA1c optimization & diabetic neuropathy checks",
        "Thyroid disorders and hormonal stabilization",
        "Geriatric senior wellness & mobility monitoring",
      ],
      leadDoctor: "Dr. Ayesha Siddiqui (MBBS, FCPS, MRCP UK)",
      feeText: "PKR 2,500 Consultation",
      image:
        "https://images.pexels.com/photos/7578803/pexels-photo-7578803.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=800",
    },
    {
      id: "pediatrics",
      name: "Pediatrics & Neonatology",
      icon: Baby,
      badge: "Child Friendly",
      tagline: "EPI Certified Immunizations & Child Development Audits",
      description:
        "Gentle, stress-free clinical environment dedicated to newborn wellness, feeding guidance, cognitive milestone audits, and seasonal childhood illness treatments.",
      highlights: [
        "Government EPI and optional recommended vaccines",
        "Infant growth charting, nutrition & weaning advice",
        "Childhood seasonal asthma and allergy relief",
        "Dedicated zero-tear vaccination protocols",
      ],
      leadDoctor: "Dr. Sana Qureshi (MBBS, DCH, FCPS Pediatrics)",
      feeText: "PKR 2,500 Consultation",
      image:
        "https://images.pexels.com/photos/5867737/pexels-photo-5867737.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=800",
    },
    {
      id: "physio",
      name: "Physiotherapy & Spine Rehab",
      icon: Activity,
      badge: "Evidence-Based",
      tagline: "Sciatica Relief, Joint Mobilization & Sports Recovery",
      description:
        "Targeted neuromuscular rehabilitation for desk job cervical pain, sciatica nerve impingement, post-surgical knee rehab, and certified clinical dry needling.",
      highlights: [
        "Therapeutic ultrasound & electrotherapy stimulation",
        "Certified dry needling for muscular trigger points",
        "Post-stroke gait and balance re-education",
        "Ergonomic postural realignment programs",
      ],
      leadDoctor: "Dr. Fatima Noor (DPT, MS-OMPT)",
      feeText: "PKR 2,200 Consultation",
      image:
        "https://images.pexels.com/photos/32115905/pexels-photo-32115905.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=800",
    },
  ];

  const current = departments.find((d) => d.id === activeDept) || departments[0];

  const waDeptLink = buildWhatsAppLink(
    settings.whatsapp,
    `Hello ${settings.clinicName}! I would like to consult about the ${current.name} department and book a slot with ${current.leadDoctor}.`
  );

  return (
    <section id="facilities" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold mb-3">
            <Activity className="w-3.5 h-3.5" />
            <span>Multi-Disciplinary Clinical Excellence</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Specialized Medical Departments & Diagnostics
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            Every clinical wing is equipped with international medical technology, specialized
            consultation rooms, and board-certified Pakistani consultants.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none">
          {departments.map((dept) => {
            const Icon = dept.icon;
            const isActive = activeDept === dept.id;
            return (
              <button
                key={dept.id}
                onClick={() => setActiveDept(dept.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center gap-2 shrink-0 border ${
                  isActive
                    ? "bg-slate-950 text-white border-slate-950 shadow-md"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-teal-400" : "text-slate-500"}`} />
                <span>{dept.name}</span>
              </button>
            );
          })}
        </div>

        {/* Featured Department Showcase Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left Info Column */}
            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
                    {current.badge}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    Lead: {current.leadDoctor}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  {current.tagline}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {current.description}
                </p>

                {/* Highlights List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {current.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left w-full sm:w-auto">
                  <span className="text-[11px] text-slate-400 block font-medium">
                    Consultation Fee
                  </span>
                  <span className="text-base font-extrabold text-teal-800">
                    {current.feeText}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={onOpenBooking}
                    className="flex-1 sm:flex-initial px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Department Slot</span>
                  </button>

                  <a
                    href={waDeptLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Photo Column */}
            <div className="lg:col-span-5 relative min-h-[280px] lg:min-h-full bg-slate-900">
              <img
                src={current.image}
                alt={current.name}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white text-xs">
                <span className="font-bold block">{current.leadDoctor}</span>
                <span className="text-slate-300 text-[11px]">Medicare Plus Lahore Suite</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
