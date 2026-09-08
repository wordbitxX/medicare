"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  MessageCircle,
  Clock,
  Sparkles,
  Video,
  Search,
  ShieldCheck,
  AlertCircle,
  Printer,
  Stethoscope,
  MapPin,
} from "lucide-react";
import { ClinicSettingsType, DoctorType, ServiceType } from "@/types";
import Navbar from "./Navbar";
import Footer from "./Footer";
import DoctorAvatar from "./DoctorAvatar";
import PatientAuthModal from "./PatientAuthModal";
import { buildWhatsAppLink, defaultWhatsAppMessages } from "@/lib/whatsapp";

interface PublicBookingPageProps {
  settings: ClinicSettingsType;
  doctors: DoctorType[];
  services: ServiceType[];
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];

const SHIFT_TIERS = [
  {
    key: "Morning OPD",
    timing: "09:00 AM - 01:00 PM",
    feeDesc: "Subsidized (PKR 1,500 - 2,000)",
    icon: Clock,
    gradient: "from-teal-600 to-emerald-600",
  },
  {
    key: "Evening Executive",
    timing: "03:30 PM - 08:30 PM",
    feeDesc: "Zero-Wait Private (PKR 2,500 - 3,500)",
    icon: Sparkles,
    gradient: "from-indigo-600 to-violet-600",
  },
  {
    key: "Video Telehealth",
    timing: "Scheduled Online",
    feeDesc: "Overseas & Remote (PKR 2,000 - 3,000)",
    icon: Video,
    gradient: "from-sky-600 to-cyan-600",
  },
] as const;

type ShiftKey = (typeof SHIFT_TIERS)[number]["key"];

function getFeeForShift(doctor: DoctorType, shift: ShiftKey): number {
  if (shift === "Video Telehealth") return Math.round(doctor.fee * 0.8);
  if (shift === "Morning OPD") return Math.max(1000, Math.round(doctor.fee * 0.7));
  return doctor.fee;
}

function getShiftWindow(shift: ShiftKey): { start: string; end: string } | null {
  if (shift === "Morning OPD") return { start: "09:00 AM", end: "01:00 PM" };
  if (shift === "Evening Executive") return { start: "03:30 PM", end: "08:30 PM" };
  return null; // Video Telehealth uses full day
}

function BookingFlow({ settings, doctors, services }: PublicBookingPageProps) {
  const searchParams = useSearchParams();
  const preDocId = searchParams.get("doctor");
  const preSvcId = searchParams.get("service");
  const preselectedService = preSvcId ? services.find((s) => s.id === Number(preSvcId)) : null;

  const [step, setStep] = useState<number>(preDocId ? 2 : 1);
  const [patientAccount, setPatientAccount] = useState<{ firstName: string; lastName: string; phone: string } | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingStep, setPendingStep] = useState<number | null>(null);
  const [selectedShift, setSelectedShift] = useState<ShiftKey>("Morning OPD");
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(
    preDocId ? Number(preDocId) : null
  );
  const [doctorSearch, setDoctorSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("All");

  const todayIso = new Date().toISOString().split("T")[0];
  const [appointmentDate, setAppointmentDate] = useState<string>(todayIso);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<Array<{ time: string; available: boolean; booked?: boolean; bookingCount?: number }>>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsMessage, setSlotsMessage] = useState("");

  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientGender, setPatientGender] = useState("Male");
  const [patientAge, setPatientAge] = useState("");
  const [patientCnic, setPatientCnic] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [reason, setReason] = useState("");
  const [existingPatient, setExistingPatient] = useState<any | null>(null);
  const [lookingUpPatient, setLookingUpPatient] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [bookedAppointment, setBookedAppointment] = useState<any>(null);

  const specialties = useMemo(
    () => ["All", ...Array.from(new Set(doctors.map((d) => d.specialty))).sort()],
    [doctors]
  );

  const filteredDoctors = useMemo(() => {
    let list = doctors;
    if (specialtyFilter !== "All") {
      list = list.filter((d) => d.specialty === specialtyFilter);
    }
    if (doctorSearch.trim()) {
      const q = doctorSearch.toLowerCase().trim();
      list = list.filter(
        (d) => d.name.toLowerCase().includes(q) || d.qualification.toLowerCase().includes(q)
      );
    }
    return list;
  }, [doctors, specialtyFilter, doctorSearch]);

  const currentDoctor = doctors.find((d) => d.id === selectedDoctorId);
  const currentFee = currentDoctor ? getFeeForShift(currentDoctor, selectedShift) : 0;

  // Check if patient already logged in
  useEffect(() => {
    fetch("/api/patient-auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated && d.account) {
          setPatientAccount({ firstName: d.account.firstName, lastName: d.account.lastName, phone: d.account.phone });
          // pre-fill form
          setPatientName(`${d.account.firstName} ${d.account.lastName}`);
          setPatientPhone(d.account.phone);
          setPatientEmail(d.account.email || "");
          setPatientGender(d.account.gender || "Male");
          setPatientCnic(d.account.cnic || "");
          setBloodGroup(d.account.bloodGroup || "");
          if (d.account.dateOfBirth) {
            const y = d.account.dateOfBirth ? Math.floor(Math.abs(new Date().getFullYear() - new Date(d.account.dateOfBirth).getFullYear())) : 0;
            if (y > 0) setPatientAge(String(y));
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const phone = patientPhone.trim();
    const cnic = patientCnic.trim();
    if ((!phone && !cnic) || step !== 3) {
      setExistingPatient(null);
      return;
    }

    const timeout = setTimeout(async () => {
      setLookingUpPatient(true);
      try {
        const params = new URLSearchParams();
        if (phone) params.set("phone", phone);
        if (cnic) params.set("cnic", cnic);
        const res = await fetch(`/api/patients/lookup?${params.toString()}`);
        const data = await res.json();
        if (res.ok && data.found && data.patient) {
          const p = data.patient;
          setExistingPatient(p);
          // Auto-fill saved details (CNIC, email, age) without overwriting what user already typed
          setPatientCnic((prev) => prev || p.cnic || "");
          setPatientEmail((prev) => prev || p.email || "");
          setPatientAge((prev) => prev || (p.age ? String(p.age) : ""));
          setPatientGender((prev) => (prev && prev !== "Male" ? prev : p.gender || prev));
          setBloodGroup((prev) => prev || p.bloodGroup || "");
          setPatientName((prev) => prev || p.name || "");
        } else {
          setExistingPatient(null);
        }
      } catch {
        setExistingPatient(null);
      } finally {
        setLookingUpPatient(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [patientPhone, patientCnic, step]);

  // Live slots
  useEffect(() => {
    if (!selectedDoctorId || !appointmentDate || step !== 2) return;
    let cancelled = false;

    async function loadSlots() {
      setSlotsLoading(true);
      setSlotsMessage("");
      try {
        const response = await fetch(
          `/api/slots?doctorId=${selectedDoctorId}&date=${encodeURIComponent(appointmentDate)}`
        );
        const data = await response.json();
        if (cancelled) return;
        if (!response.ok) throw new Error(data.error || "Unable to load slots");
        let slots = Array.isArray(data.slots) ? data.slots : [];

        // Filter slots to the selected shift window
        const window = getShiftWindow(selectedShift);
        if (window) {
          const toMin = (t: string) => {
            const m = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
            if (!m) return null;
            let h = Number(m[1]);
            const min = Number(m[2]);
            const p = m[3].toUpperCase();
            if (h === 12) h = 0;
            if (p === "PM") h += 12;
            return h * 60 + min;
          };
          const startM = toMin(window.start);
          const endM = toMin(window.end);
          if (startM !== null && endM !== null) {
            slots = slots.filter((s: { time: string; available: boolean }) => {
              const t = toMin(s.time);
              return t !== null && t >= startM && t < endM;
            });
          }
        }

        setAvailableSlots(slots);
        const firstOpen = slots.find((s: { time: string; available: boolean }) => s.available);
        setSelectedTimeSlot(firstOpen?.time || "");
        if (!data.available) {
          setSlotsMessage(data.reason || "No slots available on this date.");
        } else if (slots.length === 0) {
          setSlotsMessage(`No ${selectedShift} slots available on this date. Try another date or shift.`);
        }
      } catch (error) {
        if (!cancelled) {
          setAvailableSlots([]);
          setSelectedTimeSlot("");
          setSlotsMessage(error instanceof Error ? error.message : "Unable to load slots");
        }
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    }

    loadSlots();
    return () => {
      cancelled = true;
    };
  }, [selectedDoctorId, appointmentDate, step, selectedShift]);

   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!patientName.trim() || !patientPhone.trim()) {
       setErrorMsg("Please complete all required fields.");
       return;
     }

     // If the chosen slot is already held by another patient, ask for confirmation.
     const chosenSlot = availableSlots.find((s) => s.time === selectedTimeSlot);
     if (chosenSlot?.booked) {
       const ok = window.confirm(
         `The slot at ${selectedTimeSlot} already has a booking. You can still reserve it — it will be registered and the previous patient can be rescheduled if they arrive. Confirm?`
       );
       if (!ok) return;
     }

     setErrorMsg("");
     setIsSubmitting(true);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName,
          patientPhone,
          patientEmail,
          patientGender,
          patientAge: patientAge ? Number(patientAge) : null,
          patientCnic: patientCnic || null,
          bloodGroup: bloodGroup || null,
          doctorId: selectedDoctorId,
          serviceId: preselectedService?.id || null,
          appointmentDate,
          appointmentTime: selectedTimeSlot,
          visitType: selectedShift,
          patientNotes: reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to book appointment");
      setBookedAppointment(data.appointment);
      setStep(4);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmationWaLink = bookedAppointment
    ? buildWhatsAppLink(
        settings.whatsapp,
        defaultWhatsAppMessages.confirmation(
          settings.clinicName,
          bookedAppointment.appointmentNumber,
          currentDoctor?.name || "the consultant",
          appointmentDate,
          selectedTimeSlot
        )
      )
    : "#";

  const stepLabels = ["Shift & Consultant", "Date & Live Slot", "Patient Information"];

  const specialtyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    doctors.forEach((doc) => {
      counts[doc.specialty] = (counts[doc.specialty] || 0) + 1;
    });
    return counts;
  }, [doctors]);

  const sidebarDoctors = filteredDoctors.slice(0, 40);

   return (
     <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Patient Auth Modal */}
        <PatientAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={(acct) => {
            setPatientAccount(acct);
            setIsGuest(false);
            setPatientName(`${acct.firstName} ${acct.lastName}`);
            setPatientPhone(acct.phone);
            setShowAuthModal(false);
            if (pendingStep !== null) { setStep(pendingStep); setPendingStep(null); }
          }}
          onSkip={() => {
            setIsGuest(true);
            setShowAuthModal(false);
            if (pendingStep !== null) { setStep(pendingStep); setPendingStep(null); }
          }}
        />

       <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
         <div className="min-w-0 space-y-6">

        {/* Logged-in / guest badge */}
        {patientAccount ? (
          <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Booking as: {patientAccount.firstName} {patientAccount.lastName} ({patientAccount.phone})
            </div>
            <a href="/patient" className="text-[11px] font-bold text-emerald-700 hover:underline">
              My Portal →
            </a>
          </div>
        ) : isGuest ? (
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <ShieldCheck className="h-4 w-4 text-slate-500" />
              Continuing as Guest — details you enter below will still be saved to clinic records.
            </div>
            <button
              onClick={() => { setPendingStep(null); setShowAuthModal(true); }}
              className="ml-3 shrink-0 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
            >
              Sign In
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
              <ShieldCheck className="h-4 w-4 text-amber-500" />
              Select a doctor and login to book and save your appointment history.
            </div>
            <div className="ml-3 flex shrink-0 items-center gap-2">
              <button
                onClick={() => { setIsGuest(true); }}
                className="rounded-xl border-2 border-amber-400 bg-amber-400 px-3 py-1.5 text-[11px] font-extrabold text-amber-950 shadow-sm ring-2 ring-amber-300/40 transition hover:bg-amber-300"
              >
                Skip — Continue as Guest
              </button>
              <button
                onClick={() => { setPendingStep(null); setShowAuthModal(true); }}
                className="rounded-xl bg-[#0A2540] px-3 py-1.5 text-[11px] font-bold text-white"
              >
                Sign In / Sign Up
              </button>
            </div>
          </div>
        )}

       {/* Stepper */}
      {step < 4 && (
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white px-6 py-4 shadow-xl">
          <div className="mx-auto flex max-w-2xl items-center justify-between text-xs font-semibold">
            {stepLabels.map((label, idx) => {
              const n = idx + 1;
              const active = step >= n;
              return (
                <React.Fragment key={label}>
                  {idx > 0 && <div className="h-0.5 w-8 bg-slate-200 sm:w-16" />}
                  <div className={`flex items-center gap-2 ${active ? "font-bold text-teal-700" : "text-slate-400"}`}>
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                        active ? "bg-[#0A2540] text-white" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {n}
                    </span>
                    <span className="hidden sm:inline">{label}</span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 1: Shift + Doctor */}
      {step === 1 && (
        <div className="animate-fade-up space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Step 1 of 3</span>
            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              Select Shift & Specialist Doctor
            </h2>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Choose your preferred consultation timing tier (Morning OPD, Evening Executive, or Video Telehealth).
            </p>
          </div>

          {/* Shift tiers */}
          <div>
            <label className="mb-2 block text-xs font-bold text-slate-700">
              Select Consultation Shift Tier *
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {SHIFT_TIERS.map((tier) => {
                const active = selectedShift === tier.key;
                return (
                  <button
                    key={tier.key}
                    type="button"
                    onClick={() => {
                      setSelectedShift(tier.key);
                      setSelectedTimeSlot("");
                    }}
                    className={`btn-press rounded-2xl border-2 p-4 text-left transition ${
                      active
                        ? "border-teal-600 bg-teal-50/40 shadow-sm ring-2 ring-teal-600/20"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div
                      className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white ${
                        active ? tier.gradient : "from-slate-400 to-slate-500"
                      }`}
                    >
                      <tier.icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">{tier.key}</p>
                    <p className="mt-0.5 text-[11px] font-semibold text-teal-700">{tier.timing}</p>
                    <p className="mt-1 text-[10px] leading-snug text-slate-500">{tier.feeDesc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Doctor search + filter */}
          <div>
            <label className="mb-2 block text-xs font-bold text-slate-700">
              Choose Consultant Doctor *
            </label>

            <div className="mb-3 grid gap-2 sm:grid-cols-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                  placeholder="Search doctor name or qualification..."
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-xs focus:ring-2 focus:ring-teal-600"
                />
              </div>
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs focus:ring-2 focus:ring-teal-600"
              >
                {specialties.map((s) => (
                  <option key={s} value={s}>
                    {s === "All" ? "All Specialties" : s}
                  </option>
                ))}
              </select>
            </div>

            <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {filteredDoctors.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
                  No doctors match your search.
                </p>
              ) : (
                filteredDoctors.map((doc) => {
                  const selected = selectedDoctorId === doc.id;
                  const fee = getFeeForShift(doc, selectedShift);
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setSelectedDoctorId(doc.id)}
                      className={`flex w-full items-start gap-4 rounded-2xl border-2 p-4 text-left transition ${
                        selected
                          ? "border-teal-600 bg-teal-50/40 shadow-sm ring-2 ring-teal-600/20"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <DoctorAvatar name={doc.name} specialty={doc.specialty} avatarUrl={doc.avatarUrl} size="lg" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                            {doc.specialty}
                          </span>
                          <span className="whitespace-nowrap text-xs font-black text-slate-900">
                            PKR {fee.toLocaleString()}
                          </span>
                        </div>
                        <h4 className="mt-1 truncate text-sm font-bold text-slate-900">{doc.name}</h4>
                        <p className="truncate text-xs text-slate-500">{doc.qualification}</p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          Days: {doc.availableDays.split(",").slice(0, 4).join(", ")}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-xs text-slate-400">Assistance needed? Call: {settings.phone}</span>
            <button
              type="button"
              disabled={!selectedDoctorId}
              onClick={() => {
                if (!patientAccount && !isGuest) {
                  setPendingStep(2);
                  setShowAuthModal(true);
                } else {
                  setStep(2);
                }
              }}
              className="btn-press inline-flex items-center gap-2 rounded-xl bg-[#0A2540] px-6 py-3 text-xs font-bold text-white shadow-md transition hover:bg-[#071728] disabled:opacity-50 sm:text-sm"
            >
              <span>{patientAccount || isGuest ? "Select Date & Slot" : "Login to Continue"}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Date & Slot */}
      {step === 2 && currentDoctor && (
        <div className="animate-fade-up space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Step 2 of 3</span>
              <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                Choose Date & Live Slot
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Change Doctor / Shift</span>
            </button>
          </div>

          {/* Doctor summary */}
          <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <DoctorAvatar name={currentDoctor.name} specialty={currentDoctor.specialty} avatarUrl={currentDoctor.avatarUrl} size="md" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">{currentDoctor.name}</h4>
                <p className="text-xs text-slate-500">
                  {currentDoctor.specialty} • {currentDoctor.roomNo}
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-[11px] font-bold text-teal-800">
                {selectedShift}
              </span>
              <p className="mt-1 text-xs font-black text-slate-900">
                Consultation Fee: PKR {currentFee.toLocaleString()}
              </p>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-slate-700">Select Appointment Date *</label>
            <input
              type="date"
              value={appointmentDate}
              min={todayIso}
              onChange={(e) => setAppointmentDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-teal-600 sm:w-80"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-slate-700">
              Available Live OPD Slots ({selectedShift}) *
            </label>
            {slotsLoading ? (
              <div className="py-8 text-center text-xs text-slate-500">
                <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
                Checking live OPD availability...
              </div>
            ) : slotsMessage ? (
              <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{slotsMessage}</span>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {availableSlots.map((slot) => {
                  const active = selectedTimeSlot === slot.time;
                  const taken = slot.booked || false;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot.time)}
                      title={taken ? `Slot already has a booking — you can still choose it if the previous patient is absent.` : `Select ${slot.time}`}
                      className={`btn-press relative rounded-xl border px-2 pt-2.5 pb-1.5 text-center text-xs font-bold transition ${
                        active
                          ? "border-[#0A2540] bg-[#0A2540] text-white shadow-md"
                          : taken
                          ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                          : "border-slate-200 bg-white text-slate-800 hover:border-teal-500 hover:bg-teal-50"
                      }`}
                    >
                      <span className="block leading-tight">{slot.time}</span>
                      {taken && !active && (
                        <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-wide text-amber-600 leading-none">
                          Taken
                        </span>
                      )}
                      {taken && active && (
                        <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-wide text-white/70 leading-none">
                          Taken
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Please select a valid date above.</p>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Back
            </button>
            <button
              type="button"
              disabled={!selectedTimeSlot}
              onClick={() => setStep(3)}
              className="btn-press inline-flex items-center gap-2 rounded-xl bg-[#0A2540] px-6 py-3 text-xs font-bold text-white shadow-md transition hover:bg-[#071728] disabled:opacity-50 sm:text-sm"
            >
              <span>Patient Details</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Patient Info */}
      {step === 3 && currentDoctor && (
        <form
          onSubmit={handleSubmit}
          className="animate-fade-up space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Step 3 of 3</span>
              <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                Patient Contact Information
              </h2>
              {isGuest && !patientAccount && (
                <p className="mt-1 text-[11px] font-semibold text-slate-500">
                  Booking as Guest — these details will be saved to clinic records with your appointment.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Change Slot</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <Calendar className="h-4 w-4 text-teal-600" />
              <span>
                {appointmentDate} at {selectedTimeSlot} ({selectedShift})
              </span>
            </div>
            <div>
              <span className="text-slate-500">Consultant: </span>
              <span className="font-bold text-slate-900">{currentDoctor.name}</span>
              <span className="ml-2 font-bold text-teal-700">(PKR {currentFee.toLocaleString()})</span>
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Patient Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Tariq Mehmood"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-xs focus:ring-2 focus:ring-teal-600 sm:text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                WhatsApp / Mobile Number * (For Confirmation)
              </label>
              <input
                type="tel"
                required
                placeholder="03XX XXXXXXX"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-xs focus:ring-2 focus:ring-teal-600 sm:text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">CNIC</label>
              <input
                type="text"
                placeholder="35202-1234567-1"
                value={patientCnic}
                onChange={(e) => setPatientCnic(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-xs focus:ring-2 focus:ring-teal-600 sm:text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Email Address (Optional)</label>
              <input
                type="email"
                placeholder="patient@gmail.com"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-xs focus:ring-2 focus:ring-teal-600 sm:text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Blood Group <span className="font-normal text-slate-400">(select manually)</span>
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-xs focus:ring-2 focus:ring-teal-600 sm:text-sm"
              >
                <option value="">Select blood group</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Gender</label>
              <select
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-xs focus:ring-2 focus:ring-teal-600 sm:text-sm"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Age</label>
              <input
                type="number"
                placeholder="35"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-3 text-xs focus:ring-2 focus:ring-teal-600 sm:text-sm"
              />
            </div>
          </div>

          {lookingUpPatient && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] font-semibold text-slate-500">
              Checking previous patient record…
            </div>
          )}

          {!lookingUpPatient && existingPatient && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-extrabold text-emerald-900">
                  Previous patient record found — details auto-filled below
                </p>
                <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white">
                  {existingPatient.mrn}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-3">
                <div className="rounded-xl bg-white/80 p-2.5">
                  <p className="font-bold uppercase tracking-wide text-slate-400 text-[9px]">Name</p>
                  <p className="font-bold text-slate-900 truncate">{existingPatient.name}</p>
                </div>
                <div className="rounded-xl bg-white/80 p-2.5">
                  <p className="font-bold uppercase tracking-wide text-slate-400 text-[9px]">Phone</p>
                  <p className="font-bold text-slate-900">{existingPatient.phone}</p>
                </div>
                <div className="rounded-xl bg-white/80 p-2.5">
                  <p className="font-bold uppercase tracking-wide text-slate-400 text-[9px]">CNIC</p>
                  <p className="font-bold text-slate-900">{existingPatient.cnic || "—"}</p>
                </div>
                <div className="rounded-xl bg-white/80 p-2.5">
                  <p className="font-bold uppercase tracking-wide text-slate-400 text-[9px]">Age / Gender</p>
                  <p className="font-bold text-slate-900">{existingPatient.age} / {existingPatient.gender}</p>
                </div>
                <div className="rounded-xl bg-white/80 p-2.5">
                  <p className="font-bold uppercase tracking-wide text-slate-400 text-[9px]">Blood Group</p>
                  <p className="font-bold text-slate-900">{existingPatient.bloodGroup || "—"}</p>
                </div>
                <div className="rounded-xl bg-white/80 p-2.5">
                  <p className="font-bold uppercase tracking-wide text-slate-400 text-[9px]">Total Visits</p>
                  <p className="font-bold text-slate-900">{existingPatient.totalVisits ?? 1}</p>
                </div>
              </div>
              <p className="mt-2 text-[10px] text-emerald-800">
                CNIC, email and age auto-filled. This new visit will be linked to the same patient history.
              </p>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              Primary Symptoms / Medical Reason for Visit
            </label>
            <textarea
              rows={3}
              placeholder="Describe symptoms or medical history..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs focus:ring-2 focus:ring-teal-600 sm:text-sm"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 shrink-0 text-teal-600" />
            <span>Secure booking. Payment is settled at clinic reception via Cash or Card on arrival.</span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-press inline-flex items-center gap-2 rounded-xl bg-[#0A2540] px-8 py-3.5 text-xs font-bold text-white shadow-md transition hover:bg-[#071728] disabled:opacity-50 sm:text-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Confirming Slot...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Confirm OPD Appointment</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 4: Success Slip */}
      {step === 4 && bookedAppointment && (
        <div className="animate-fade-up space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
              Appointment Successfully Registered
            </span>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Slot Confirmed with Consultant
            </h2>
            <p className="mx-auto max-w-md text-xs text-slate-500 sm:text-sm">
              Your appointment slip has been generated and queued at clinic reception.
            </p>
          </div>

          <div className="mx-auto max-w-xl space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-xs sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Reference Code
                </span>
                <p className="text-xl font-black tracking-tight text-[#0A2540] sm:text-2xl">
                  {bookedAppointment.appointmentNumber}
                </p>
              </div>
              <div className="text-right">
                <span className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white">
                  CONFIRMED
                </span>
                <p className="mt-1 text-xs text-slate-500">{selectedShift}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="block font-medium text-slate-400">Patient Name</span>
                <span className="text-sm font-bold text-slate-900">{bookedAppointment.patientName}</span>
              </div>
              <div>
                <span className="block font-medium text-slate-400">Phone</span>
                <span className="text-sm font-bold text-slate-900">{bookedAppointment.patientPhone}</span>
              </div>
              <div>
                <span className="block font-medium text-slate-400">Consultant Doctor</span>
                <span className="text-sm font-bold text-slate-900">{currentDoctor?.name}</span>
              </div>
              <div>
                <span className="block font-medium text-slate-400">Consultation Fee</span>
                <span className="text-sm font-bold text-teal-700">PKR {currentFee.toLocaleString()}</span>
              </div>
              <div>
                <span className="block font-medium text-slate-400">Date & Time</span>
                <span className="text-sm font-bold text-slate-900">
                  {appointmentDate} at {selectedTimeSlot}
                </span>
              </div>
              <div>
                <span className="block font-medium text-slate-400">Hospital Location</span>
                <span className="text-sm font-bold text-slate-900">{settings.address}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-[11px] text-slate-500">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-teal-600" />
              <span>
                {settings.clinicName}, {settings.city} — Please arrive 15 minutes before your slot.
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-press inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <Printer className="h-4 w-4" />
              Print Slip
            </button>
            <a
              href={confirmationWaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-press inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-md transition hover:bg-emerald-500"
            >
              <MessageCircle className="h-4 w-4" />
              Confirm on WhatsApp
            </a>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setSelectedDoctorId(null);
                setSelectedTimeSlot("");
                setPatientName("");
                setPatientPhone("");
                setPatientEmail("");
                setPatientAge("");
                setBloodGroup("");
                setReason("");
                setBookedAppointment(null);
              }}
              className="btn-press inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Book Another Visit
            </button>
          </div>
        </div>
      )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-teal-700">
                    Specialist Panel
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-900">
                    {doctors.length}
                  </p>
                  <p className="text-[11px] text-slate-500">Total consultants on OPD</p>
                </div>
                <div className="rounded-2xl bg-teal-50 p-3 text-teal-700">
                  <Stethoscope className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 max-h-[210px] overflow-y-auto pr-1 space-y-1.5">
                {Object.entries(specialtyCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([sp, count]) => (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => setSpecialtyFilter(sp)}
                      className={`w-full flex items-center justify-between text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition ${
                        specialtyFilter === sp
                          ? "bg-teal-600 text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span className="truncate mr-2">{sp}</span>
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                        specialtyFilter === sp ? "bg-white/25" : "bg-slate-100 text-slate-500"
                      }`}>{count}</span>
                    </button>
                  ))}
              </div>
              {specialtyFilter !== "All" && (
                <button
                  type="button"
                  onClick={() => setSpecialtyFilter("All")}
                  className="mt-3 w-full py-2 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
                >
                  Reset filter
                </button>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-black text-slate-900">
                  {specialtyFilter === "All" ? "All specialists" : specialtyFilter}
                </p>
                <span className="text-[10px] font-bold text-slate-500">
                  {sidebarDoctors.length} shown
                </span>
              </div>
              <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                {sidebarDoctors.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-[11px] text-slate-500">
                    No doctors match this filter yet.
                  </p>
                ) : (
                  sidebarDoctors.map((doc) => {
                    const selected = selectedDoctorId === doc.id;
                    const fee = getFeeForShift(doc, selectedShift);
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => {
                          setSelectedDoctorId(doc.id);
                          if (step > 2) setStep(2);
                        }}
                        className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition ${
                          selected
                            ? "border-teal-600 bg-teal-50/50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-100 shrink-0 shadow-inner">
                          {doc.avatarUrl ? (
                            <img src={doc.avatarUrl} alt={doc.name} className="w-full h-full object-cover object-top" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-900 text-teal-300 text-[11px] font-bold">
                              {doc.name
                                .replace(/^Dr\.?\s*/i, "")
                                .split(" ")
                                .filter((w) => w.length > 1)
                                .map((w) => w[0])
                                .join("")
                                .slice(0, 2)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-black text-slate-900 truncate">
                            {doc.name}
                          </p>
                          <p className="text-[10px] font-semibold text-teal-700 truncate">
                            {doc.specialty}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">
                            PKR {fee.toLocaleString()} · {doc.availableDays.split(",").slice(0, 3).join(",")}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function PublicBookingPage({ settings, doctors, services }: PublicBookingPageProps) {
  return (
    <div className="min-h-screen bg-slate-50/60">
      <Navbar
        settings={settings}
        onOpenBooking={() => {}}
        onOpenTracker={() => {
          window.location.href = "/track";
        }}
      />

      <main>
        <section className="relative overflow-hidden border-b border-white/10 bg-[#071728] py-14 text-center text-white">
          <div className="liquid-blob-slow pointer-events-none absolute -left-24 -top-24 h-72 w-72 bg-teal-500/10" />
          <div className="liquid-blob pointer-events-none absolute -right-16 bottom-0 h-64 w-64 bg-emerald-400/10" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-300">
              <Calendar className="h-3.5 w-3.5" /> Online OPD Scheduling
            </span>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              Book a Clinic Appointment
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-white/60">
              Book in 60 seconds — WhatsApp confirmation included. Morning OPD 9AM–1PM · Evening
              Executive 2:30PM–9PM · Video consults for overseas patients.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={buildWhatsAppLink(settings.whatsapp, defaultWhatsAppMessages.book(settings.clinicName))}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-press inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-500"
              >
                <MessageCircle className="h-4 w-4" />
                Book via WhatsApp
              </a>
            </div>
          </div>
        </section>

        <div className="-mt-8 pb-16">
          <Suspense
            fallback={
              <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-xl">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
                <p className="text-xs font-semibold text-slate-600">
                  Loading Shalamar Hospital standard OPD slots...
                </p>
              </div>
            }
          >
            <BookingFlow settings={settings} doctors={doctors} services={services} />
          </Suspense>
        </div>

        {/* Trust strip */}
        <section className="border-t border-slate-200 bg-white py-10">
          <div className="mx-auto grid max-w-5xl gap-4 px-4 sm:grid-cols-3 sm:px-6">
            {[
              { icon: ShieldCheck, title: "PMDC Certified Care", desc: "100% verified postgraduate specialist faculty." },
              { icon: Clock, title: "Painless Cancellations", desc: "Reschedule anytime at least 2 hours before your slot." },
              { icon: Stethoscope, title: "Transparent PKR Pricing", desc: "No hidden facility or registration charges." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer
        settings={settings}
        onOpenBooking={() => {}}
        onOpenTracker={() => {
          window.location.href = "/track";
        }}
      />
    </div>
  );
}
