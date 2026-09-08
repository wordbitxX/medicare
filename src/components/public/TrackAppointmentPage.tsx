"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Hash,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Stethoscope,
  User,
} from "lucide-react";
import { ClinicSettingsType } from "@/types";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { buildWhatsAppLink, defaultWhatsAppMessages } from "@/lib/whatsapp";

interface TrackAppointmentPageProps {
  settings: ClinicSettingsType;
}

interface TrackedAppointment {
  id: number;
  appointmentNumber: string;
  patientName: string;
  patientPhone: string;
  patientCnic: string | null;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  fee: number;
  paymentStatus: string;
  visitType: string;
  doctorName: string | null;
  doctorSpecialty: string | null;
  doctorRoom: string | null;
  serviceName: string | null;
  prescription: string | null;
}

export default function TrackAppointmentPage({ settings }: TrackAppointmentPageProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TrackedAppointment[] | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      setErrorMessage("Please enter a reference number, your name, or CNIC.");
      setResults(null);
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setResults(null);

    try {
      const res = await fetch(`/api/appointments/track?query=${encodeURIComponent(q)}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No appointments found.");
      }
      setResults(data.rows || []);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to search. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const normalizeStatus = (status: string) => {
    const raw = String(status || "Pending").trim().toLowerCase();
    if (["completed", "complete", "done", "finished"].includes(raw)) return "Completed";
    if (raw === "in consultation") return "In Consultation";
    if (raw === "confirmed") return "Confirmed";
    if (raw === "cancelled") return "Cancelled";
    if (raw === "no-show") return "No-Show";
    return "Pending";
  };

  const getStatusMeta = (status: string) => {
    const normalized = normalizeStatus(status);
    if (normalized === "Completed") {
      return { label: "COMPLETED", icon: <CheckCircle2 className="h-3.5 w-3.5" />, className: "bg-emerald-600" };
    }
    if (normalized === "Cancelled") {
      return { label: "CANCELLED", icon: <AlertCircle className="h-3.5 w-3.5" />, className: "bg-rose-600" };
    }
    if (normalized === "In Consultation") {
      return { label: "IN CONSULTATION", icon: <Stethoscope className="h-3.5 w-3.5" />, className: "bg-blue-600" };
    }
    if (normalized === "No-Show") {
      return { label: "NO-SHOW", icon: <AlertCircle className="h-3.5 w-3.5" />, className: "bg-slate-600" };
    }
    if (normalized === "Confirmed") {
      return { label: "CONFIRMED", icon: <CheckCircle2 className="h-3.5 w-3.5" />, className: "bg-teal-600" };
    }
    return { label: "PENDING", icon: <Clock className="h-3.5 w-3.5" />, className: "bg-amber-500" };
  };

  return (
    <div className="min-h-screen bg-slate-50/60">
      <Navbar
        settings={settings}
        onOpenBooking={() => { window.location.href = "/book"; }}
        onOpenTracker={() => {}}
      />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#071728] py-14 text-center text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }}
          />
          <div className="liquid-blob-slow pointer-events-none absolute -left-20 top-0 h-72 w-72 bg-teal-500/10" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-300">
              <Search className="h-3.5 w-3.5" /> Appointment Tracker
            </span>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              Track Your Appointment
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/60">
              Search using your reference number, patient name, or CNIC.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-2xl -translate-y-8 px-4 pb-16 sm:px-6">
          {/* Search Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <form onSubmit={handleSearch} className="space-y-3">
              <label className="block text-sm font-bold text-slate-800">
                Reference number, patient name, or CNIC
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Reference no, full name, or CNIC"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-3 text-sm font-medium tracking-wide focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-press inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A2540] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#071728] disabled:opacity-50"
                >
                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>

              {/* Search hints */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Hash className="h-3 w-3 text-teal-600" /> Reference number
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3 text-teal-600" /> Patient full name
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-teal-600" /> CNIC
                </span>
              </div>
            </form>
          </div>

          {/* Error */}
          {errorMessage && (
            <div className="mt-5 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-bold">Not Found</p>
                <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Results */}
          {results && results.length > 0 && (
            <div className="mt-5 space-y-5">
              <p className="text-sm font-bold text-slate-700">
                {results.length} appointment{results.length > 1 ? "s" : ""} found
              </p>

              {results.map((appointment) => {
                const normalizedStatus = normalizeStatus(appointment.status);
                const done = normalizedStatus === "Completed";
                const statusMeta = getStatusMeta(normalizedStatus);

                const waLink = buildWhatsAppLink(
                  settings.whatsapp,
                  defaultWhatsAppMessages.askAboutAppointment(
                    settings.clinicName,
                    appointment.appointmentNumber
                  )
                );

                return (
                  <div key={appointment.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
                    {/* Header row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-6">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Reference
                        </p>
                        <p className="font-mono text-lg font-black text-[#0A2540]">
                          {appointment.appointmentNumber}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white ${statusMeta.className}`}
                      >
                        {statusMeta.icon}
                        {statusMeta.label}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="p-5 sm:p-6">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <User className="h-3 w-3" /> Patient
                          </span>
                          <p className="mt-1 text-sm font-bold text-slate-900">{appointment.patientName}</p>
                          {appointment.patientCnic && (
                            <p className="mt-0.5 text-[11px] text-slate-500">CNIC: {appointment.patientCnic}</p>
                          )}
                        </div>

                        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <Stethoscope className="h-3 w-3" /> Consultant
                          </span>
                          <p className="mt-1 text-sm font-bold text-slate-900">
                            {appointment.doctorName || "Assigned Specialist"}
                          </p>
                          {appointment.doctorSpecialty && (
                            <p className="mt-0.5 text-[11px] text-slate-500">{appointment.doctorSpecialty}</p>
                          )}
                        </div>

                        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <Calendar className="h-3 w-3" /> Date & Time
                          </span>
                          <p className="mt-1 text-sm font-bold text-teal-700">
                            {appointment.appointmentDate} at {appointment.appointmentTime}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-500">{appointment.visitType}</p>
                        </div>

                        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <MapPin className="h-3 w-3" /> Room / OPD
                          </span>
                          <p className="mt-1 text-sm font-bold text-slate-900">
                            {appointment.doctorRoom || "Consultation OPD"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal-100 bg-teal-50/50 px-4 py-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
                            Consultation Fee
                          </p>
                          <p className="text-lg font-black text-teal-800">
                            PKR {Number(appointment.fee).toLocaleString()}
                          </p>
                        </div>
                        <span className={`rounded-lg px-3 py-1 text-xs font-bold ${
                          appointment.paymentStatus === "Paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {appointment.paymentStatus === "Paid" ? "Completed" : appointment.paymentStatus || "Pending"}
                        </span>
                      </div>

                      {/* Prescription — shown only if completed and prescription is on record */}
                      {done && appointment.prescription && (
                        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <FileText className="h-3.5 w-3.5 text-teal-600" /> Prescription
                          </p>
                          <pre className="mt-2 whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-700">
                            {appointment.prescription}
                          </pre>
                        </div>
                      )}

                      {/* Status message */}
                      <div className="mt-4 flex items-start gap-2 rounded-2xl border border-slate-100 bg-white p-4">
                        <div
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                            done ? "bg-slate-700 text-white" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {done ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900">
                            {normalizedStatus === "Completed"
                              ? "Consultation completed"
                              : normalizedStatus === "Cancelled"
                              ? "Appointment cancelled"
                              : normalizedStatus === "In Consultation"
                              ? "Consultation in progress"
                              : normalizedStatus === "Confirmed"
                              ? "Appointment confirmed"
                              : normalizedStatus === "No-Show"
                              ? "Appointment marked as no-show"
                              : "Appointment pending"}
                          </p>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                            {normalizedStatus === "Completed"
                              ? "Your visit is recorded. Contact reception for follow-up bookings or lab reports."
                              : normalizedStatus === "Cancelled"
                              ? "This appointment has been cancelled. Please contact reception if you need a new booking."
                              : normalizedStatus === "In Consultation"
                              ? "Your consultation is currently in progress."
                              : normalizedStatus === "Confirmed"
                              ? "Your appointment is confirmed. Please arrive 15 minutes before your scheduled time."
                              : normalizedStatus === "No-Show"
                              ? "This appointment was marked as no-show. Contact reception if you need assistance."
                              : "Please arrive 15 minutes before your scheduled time. Bring your reference number."}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-press inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-md transition hover:bg-emerald-500"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Ask About This Appointment
                        </a>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="btn-press inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                          Print Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {!results && !errorMessage && !loading && (
            <div className="mt-5 rounded-3xl border border-dashed border-slate-200 bg-white/60 p-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Search className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-slate-600">Search to find your appointment</p>
              <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed text-slate-400">
                Use your appointment reference number (e.g.{" "}
                <span className="font-mono text-teal-700">MED-2026-1001</span>), your full name,
                or CNIC number.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer
        settings={settings}
        onOpenBooking={() => { window.location.href = "/book"; }}
        onOpenTracker={() => {}}
      />
    </div>
  );
}
