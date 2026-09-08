"use client";

import Link from "next/link";
import { Calendar, ArrowLeft, Award, Clock, DollarSign, MapPin, MessageCircle, Stethoscope } from "lucide-react";
import { ClinicSettingsType, DoctorType } from "@/types";
import DoctorAvatar from "./DoctorAvatar";
import DoctorsSection from "./DoctorsSection";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingWhatsApp from "./FloatingWhatsApp";
import { buildWhatsAppLink } from "@/lib/whatsapp";

interface Props {
  doctor: DoctorType;
  settings: ClinicSettingsType;
  relatedDoctors: DoctorType[];
}

export default function PublicDoctorProfilePage({ doctor, settings, relatedDoctors }: Props) {
  const waLink = buildWhatsAppLink(
    settings.whatsapp,
    `Hello ${settings.clinicName}! I would like to book an appointment with ${doctor.name} (${doctor.specialty}).`
  );

  return (
    <div className="min-h-screen bg-slate-50/60">
      <Navbar
        settings={settings}
        onOpenBooking={() => { window.location.href = `/book?doctor=${doctor.id}`; }}
        onOpenTracker={() => { window.location.href = "/track"; }}
      />
      <div className="relative overflow-hidden border-b border-white/10 bg-[#071728] py-14 text-white">
        <div className="liquid-blob-slow pointer-events-none absolute -left-24 -top-24 h-72 w-72 bg-teal-500/10" />
        <div className="liquid-blob pointer-events-none absolute -right-16 bottom-0 h-64 w-64 bg-emerald-400/10" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href="/doctors" className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 transition hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> All Doctors
          </Link>
          <div className="flex flex-wrap items-start gap-6">
            <DoctorAvatar name={doctor.name} specialty={doctor.specialty} avatarUrl={doctor.avatarUrl} size="xl" />
            <div className="min-w-0 flex-1">
              <span className="inline-block rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-300">
                {doctor.specialty}
              </span>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
                {doctor.name}
              </h1>
              <p className="mt-2 text-base text-slate-300 md:text-lg">{doctor.qualification}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-emerald-400" />
                  {doctor.experienceYears}+ years experience
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-emerald-400" />
                  {doctor.shiftStart} – {doctor.shiftEnd}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  {doctor.roomNo}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <Stethoscope className="h-5 w-5 text-teal-600" /> About {doctor.name}
              </h2>
              <p className="mt-4 leading-7 text-slate-600">{doctor.bio}</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h3 className="text-lg font-bold text-slate-900">OPD Schedule</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Consultation Days</div>
                  <div className="mt-1 text-sm font-bold text-slate-900">{doctor.availableDays}</div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Shift Timings</div>
                  <div className="mt-1 text-sm font-bold text-slate-900">{doctor.shiftStart} – {doctor.shiftEnd}</div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Room</div>
                  <div className="mt-1 text-sm font-bold text-slate-900">{doctor.roomNo}</div>
                </div>
                <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-teal-600">
                    <DollarSign className="h-3 w-3" /> Consultation Fee
                  </div>
                  <div className="mt-1 text-xl font-black text-teal-800">PKR {doctor.fee.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {relatedDoctors.length > 0 && (
              <div>
                <h3 className="mb-4 text-lg font-bold text-slate-900">More {doctor.specialty} Consultants</h3>
                <DoctorsSection
                  doctors={relatedDoctors}
                  settings={settings}
                  onSelectDoctorToBook={(id) => {
                    window.location.href = `/book?doctor=${id}`;
                  }}
                  showFullControls={false}
                />
              </div>
            )}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Consultation Fee</div>
              <div className="mt-1 text-3xl font-black text-[#0A2540]">PKR {doctor.fee.toLocaleString()}</div>
              <p className="mt-1 text-xs text-slate-500">Per visit · {doctor.slotDurationMinutes} min slot</p>

              <Link
                href={`/book?doctor=${doctor.id}`}
                className="btn-press mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A2540] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#071728]"
              >
                <Calendar className="h-4 w-4" /> Book Appointment
              </Link>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-press mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-3.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
              >
                <MessageCircle className="h-4 w-4 fill-emerald-600 text-white" /> Book via WhatsApp
              </a>

              <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-5 text-xs text-slate-600">
                <div className="flex justify-between"><span>Specialty</span><strong className="text-slate-900">{doctor.specialty}</strong></div>
                <div className="flex justify-between"><span>Experience</span><strong className="text-slate-900">{doctor.experienceYears}+ yrs</strong></div>
                <div className="flex justify-between"><span>Rating</span><strong className="text-amber-600">★ {doctor.rating} ({doctor.reviewsCount} reviews)</strong></div>
              </div>
            </div>

            <div className="rounded-3xl border border-teal-200 bg-gradient-to-br from-teal-600 to-emerald-700 p-6 text-white shadow-xl">
              <h4 className="text-sm font-bold">Need help deciding?</h4>
              <p className="mt-1 text-xs text-white/85">Call our reception and we will help you choose the right specialist for your condition.</p>
              <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="btn-press mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-teal-700 transition hover:bg-teal-50">
                <MapPin className="h-4 w-4" /> {settings.phone}
              </a>
            </div>
          </aside>
        </div>
      </div>

      <Footer
        settings={settings}
        onOpenBooking={() => { window.location.href = `/book?doctor=${doctor.id}`; }}
        onOpenTracker={() => { window.location.href = "/track"; }}
      />
      <div className="hidden sm:block">
        <FloatingWhatsApp
          clinicName={settings.clinicName}
          whatsappNumber={settings.whatsapp}
          emergencyPhone={settings.emergencyPhone}
          onOpenBooking={() => { window.location.href = `/book?doctor=${doctor.id}`; }}
        />
      </div>
    </div>
  );
}
