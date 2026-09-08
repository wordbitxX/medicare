"use client";

import React, { useMemo, useState } from "react";
import {
  Calendar,
  MessageCircle,
  Star,
  Award,
  Clock,
  X,
  CheckCircle2,
  ShieldCheck,
  Search,
  Stethoscope,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { DoctorType, ClinicSettingsType } from "@/types";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import DoctorAvatar from "./DoctorAvatar";
import { OPD_SPECIALTY } from "@/lib/specialty-match";

interface DoctorsSectionProps {
  doctors: DoctorType[];
  settings: ClinicSettingsType;
  onSelectDoctorToBook: (doctorId: number) => void;
  showFullControls?: boolean;
  previewLimit?: number;
}

const PAGE_SIZE = 12;

export default function DoctorsSection({
  doctors,
  settings,
  onSelectDoctorToBook,
  showFullControls = true,
  previewLimit,
}: DoctorsSectionProps) {
  const [selectedDoctorModal, setSelectedDoctorModal] = useState<DoctorType | null>(null);
  const [specialtyFilter, setSpecialtyFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const specialties = useMemo(
    () => ["All", ...Array.from(new Set(doctors.map((d) => d.specialty)))],
    [doctors]
  );

  const filteredDoctors = useMemo(() => {
    let list = doctors;
    if (specialtyFilter !== "All") {
      list = list.filter((d) => d.specialty === specialtyFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q) ||
          d.qualification.toLowerCase().includes(q)
      );
    }
    return list;
  }, [doctors, specialtyFilter, searchQuery]);

  const visibleDoctors = previewLimit
    ? doctors.slice(0, previewLimit)
    : showFullControls
    ? filteredDoctors.slice(0, visibleCount)
    : filteredDoctors;
  const hasMore = !previewLimit && showFullControls && visibleCount < filteredDoctors.length;

  return (
    <section id="doctors" className="border-b border-slate-200 bg-slate-50 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-100/70 px-3.5 py-1 text-xs font-bold text-blue-950">
            <Award className="h-3.5 w-3.5 text-blue-700" />
            <span>{doctors.length}+ PMC Verified Medical Consultants</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Consult With Our Senior Medical Faculty
          </h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            {doctors.length} specialists across {specialties.length - 1} clinical departments — filter by
            specialty or search by name to find the right consultant for you.
          </p>

          {showFullControls && (
            <div className="mt-6 mx-auto max-w-md">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  placeholder="Search doctor name or specialty..."
                  className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-xs transition focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
                />
              </div>
            </div>
          )}

          {/* Specialty Filter Pills — horizontally scrollable on mobile */}
          <div className="no-scrollbar mt-6 -mx-4 flex items-center gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
            {specialties.map((spec) => (
              <button
                key={spec}
                onClick={() => {
                  setSpecialtyFilter(spec);
                  setVisibleCount(PAGE_SIZE);
                }}
                className={`btn-press shrink-0 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  specialtyFilter === spec
                    ? "bg-slate-950 text-white shadow-xs"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {spec}
                {spec !== "All" && (
                  <span className="ml-1 opacity-60">
                    ({doctors.filter((d) => d.specialty === spec).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Not sure which doctor? OPD recommendation banner */}
        {showFullControls && specialtyFilter === "All" && !searchQuery && (
          <div className="mb-8 flex flex-col items-center justify-between gap-4 rounded-3xl border border-teal-200 bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 p-5 sm:flex-row sm:p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-md">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 sm:text-base">
                  Not sure which specialist you need?
                </h3>
                <p className="text-xs text-slate-600 sm:text-sm">
                  Book a General Physician (OPD) — they'll examine you and refer the right specialist if needed.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSpecialtyFilter(OPD_SPECIALTY)}
              className="btn-press w-full shrink-0 rounded-full bg-teal-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md transition hover:bg-teal-700 sm:w-auto"
            >
              View OPD / General Physicians
            </button>
          </div>
        )}

        {/* Doctors Grid */}
        {visibleDoctors.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-sm font-semibold text-slate-500">
              No doctors match your search. Try a different specialty or name.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleDoctors.map((doctor) => {
              const waDoctorLink = buildWhatsAppLink(
                settings.whatsapp,
                `Hello ${settings.clinicName}! I would like to inquire about appointment slots for ${doctor.name} (${doctor.specialty}).`
              );

              return (
                <div
                  key={doctor.id}
                  className="card-lift-premium animate-fade-up group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm"
                >
                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      <DoctorAvatar name={doctor.name} specialty={doctor.specialty} avatarUrl={doctor.avatarUrl} size="lg" />
                      <div className="min-w-0 flex-1 pt-1">
                        <div className="mb-1 flex items-center gap-1 text-[11px] font-bold text-amber-600">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {doctor.rating}
                          <span className="font-normal text-slate-400">({doctor.reviewsCount})</span>
                        </div>
                        <h3 className="truncate text-[15px] font-extrabold text-slate-950 transition-colors group-hover:text-teal-700">
                          {doctor.name}
                        </h3>
                        <p className="truncate text-xs font-semibold text-teal-700">{doctor.specialty}</p>
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-1 text-[11px] text-slate-500">{doctor.qualification}</p>

                    {/* Metadata */}
                    <div className="mt-3.5 space-y-1.5 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Experience:</span>
                        <span className="font-bold text-slate-800">{doctor.experienceYears}+ Years</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span className="text-slate-400">Fee:</span>
                        <span className="font-black text-teal-800">
                          PKR {doctor.fee.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 px-5 pb-5">
                    <button
                      onClick={() => onSelectDoctorToBook(doctor.id)}
                      className="btn-press flex w-full items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-3 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-teal-700"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Book Consultation</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/doctor/${doctor.id}`}
                        className="flex-1 rounded-lg bg-slate-100 px-2 py-1.5 text-center text-[11px] font-semibold text-slate-700 transition-colors hover:bg-slate-200"
                      >
                        Profile & Bio
                      </Link>
                      <a
                        href={waDoctorLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-[11px] font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
                        title="Chat about appointment on WhatsApp"
                      >
                        <MessageCircle className="h-3 w-3 fill-emerald-600 text-emerald-50" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {hasMore && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="btn-press inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              Show More Doctors
              <ChevronDown className="h-4 w-4" />
              <span className="text-xs font-normal text-slate-400">
                ({visibleDoctors.length} of {filteredDoctors.length})
              </span>
            </button>
          </div>
        )}

        {previewLimit && doctors.length > previewLimit && (
          <div className="mt-10 flex justify-center">
            <Link
              href="/doctors"
              className="btn-press inline-flex items-center gap-2 rounded-full bg-slate-950 px-7 py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              View All {doctors.length} Doctors
              <ChevronDown className="h-4 w-4 -rotate-90" />
            </Link>
          </div>
        )}
      </div>

      {/* Doctor Profile Modal */}
      {selectedDoctorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/75 p-4 backdrop-blur-xs">
          <div className="animate-fade-up relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 p-6">
              <button
                onClick={() => setSelectedDoctorModal(null)}
                className="absolute right-4 top-4 rounded-full bg-white/10 p-1.5 text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-4">
                <DoctorAvatar name={selectedDoctorModal.name} specialty={selectedDoctorModal.specialty} avatarUrl={selectedDoctorModal.avatarUrl} size="xl" />
                <div className="min-w-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                    {selectedDoctorModal.specialty}
                  </span>
                  <h3 className="truncate text-xl font-extrabold text-white">{selectedDoctorModal.name}</h3>
                  <p className="truncate text-xs text-slate-300">{selectedDoctorModal.qualification}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-6 text-xs">
              <div>
                <h4 className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-slate-900">
                  <ShieldCheck className="h-4 w-4 text-teal-600" />
                  <span>Clinical Biography & Background</span>
                </h4>
                <p className="leading-relaxed text-slate-600">{selectedDoctorModal.bio}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <span className="block text-[11px] text-slate-400">OPD Suite</span>
                  <span className="font-bold text-slate-900">{selectedDoctorModal.roomNo}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-400">Consultation Fee</span>
                  <span className="font-black text-teal-800">
                    PKR {selectedDoctorModal.fee.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-400">Consultation Days</span>
                  <span className="font-semibold text-slate-800">{selectedDoctorModal.availableDays}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-400">Shift Timings</span>
                  <span className="font-semibold text-slate-800">
                    {selectedDoctorModal.shiftStart} - {selectedDoctorModal.shiftEnd}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  onClick={() => setSelectedDoctorModal(null)}
                  className="px-4 py-2.5 font-semibold text-slate-600 hover:text-slate-800"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const docId = selectedDoctorModal.id;
                    setSelectedDoctorModal(null);
                    onSelectDoctorToBook(docId);
                  }}
                  className="btn-press rounded-xl bg-teal-600 px-6 py-2.5 font-bold text-white shadow-md hover:bg-teal-700"
                >
                  Book Appointment Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
