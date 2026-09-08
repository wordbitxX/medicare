"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  FileText,
  Loader2,
  LogOut,
  MessageCircle,
  Phone,
  Save,
  ShieldCheck,
  Star,
  User,
  X,
} from "lucide-react";
import { ClinicSettingsType } from "@/types";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { buildWhatsAppLink, defaultWhatsAppMessages } from "@/lib/whatsapp";

interface PatientPortalProps {
  settings: ClinicSettingsType;
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function PatientPortal({ settings }: PatientPortalProps) {
  const [account, setAccount] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "appointments" | "profile">("overview");
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [editError, setEditError] = useState("");
  const [viewPrescription, setViewPrescription] = useState<any | null>(null);

  const [form, setForm] = useState<any>({});

  useEffect(() => {
    fetchMe();
  }, []);

  const fetchMe = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/patient-auth/me");
      const data = await res.json();
      if (!data.authenticated) {
        window.location.href = "/patient/login";
        return;
      }
      setAccount(data.account);
      setAppointments(data.appointments || []);
      setForm(data.account);
    } catch {
      window.location.href = "/patient/login";
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/patient-auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setEditError("");
    try {
      const res = await fetch("/api/patient-auth/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAccount({ ...account, ...form });
      setEditMode(false);
      setSaveMsg("Profile updated successfully.");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (err: any) {
      setEditError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const InputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10";

  const pending = appointments.filter((a) => a.status === "Pending");
  const completed = appointments.filter((a) => a.status === "Completed");
  const totalPaid = completed.reduce((sum, a) => sum + (a.fee || 0), 0);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-teal-600" />
          <p className="mt-3 text-sm font-semibold text-slate-500">Loading your patient portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar settings={settings} onOpenBooking={() => { window.location.href = "/book"; }} onOpenTracker={() => { window.location.href = "/track"; }} />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-teal-700">
              <ShieldCheck className="h-3.5 w-3.5" /> Patient Portal
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              {account?.firstName} {account?.lastName}
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">{account?.phone}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0A2540] px-4 py-2.5 text-xs font-bold text-white shadow-md"
            >
              <Calendar className="h-4 w-4" /> Book Appointment
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </div>

        {/* Save message */}
        {saveMsg && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="h-4 w-4" /> {saveMsg}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 inline-flex rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xs">
          {[
            { key: "overview", label: "Overview", icon: Activity },
            { key: "appointments", label: "My Appointments", icon: Calendar },
            { key: "profile", label: "My Profile", icon: User },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                activeTab === key
                  ? "bg-[#0A2540] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { icon: Calendar, label: "Total Visits", value: appointments.length },
                { icon: Clock, label: "Upcoming", value: pending.length },
                { icon: CheckCircle2, label: "Completed", value: completed.length },
                { icon: Activity, label: "Total Spent", value: `PKR ${totalPaid.toLocaleString()}` },
              ].map((card) => (
                <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{card.label}</p>
                      <p className="mt-1 text-2xl font-black text-slate-900">{card.value}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                      <card.icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Upcoming */}
            {pending.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <h3 className="mb-4 text-sm font-extrabold text-slate-900">Upcoming Appointments</h3>
                <div className="space-y-3">
                  {pending.slice(0, 3).map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs">
                      <div>
                        <p className="font-extrabold text-slate-900">{apt.doctorName || "Doctor"}</p>
                        <p className="text-slate-500">{apt.doctorSpecialty}</p>
                        <p className="mt-0.5 font-semibold text-amber-700">
                          {apt.appointmentDate} at {apt.appointmentTime}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-black text-slate-700">{apt.appointmentNumber}</p>
                        <p className="font-bold text-teal-700">PKR {apt.fee?.toLocaleString()}</p>
                        <a
                          href={buildWhatsAppLink(settings.whatsapp, defaultWhatsAppMessages.askAboutAppointment(settings.clinicName, apt.appointmentNumber))}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white"
                        >
                          <MessageCircle className="h-3 w-3" /> Ask
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent prescriptions */}
            {completed.some((a) => a.prescription) && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <h3 className="mb-4 text-sm font-extrabold text-slate-900">Recent Prescriptions</h3>
                <div className="space-y-2">
                  {completed
                    .filter((a) => a.prescription)
                    .slice(0, 3)
                    .map((apt) => (
                      <button
                        key={apt.id}
                        onClick={() => setViewPrescription(apt)}
                        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs hover:bg-white"
                      >
                        <div className="text-left">
                          <p className="font-bold text-slate-900">{apt.doctorName}</p>
                          <p className="text-slate-500">{apt.appointmentDate}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-teal-700 font-bold">
                          <FileText className="h-4 w-4" /> View Rx
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* APPOINTMENTS */}
        {activeTab === "appointments" && (
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-3 text-sm font-bold text-slate-600">No appointments yet</p>
                <Link href="/book" className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#0A2540] px-5 py-2.5 text-xs font-bold text-white">
                  Book Your First Appointment
                </Link>
              </div>
            ) : (
              appointments.map((apt) => (
                <div key={apt.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black text-slate-500">{apt.appointmentNumber}</span>
                        <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${apt.status === "Completed" ? "bg-slate-100 text-slate-700" : "bg-amber-100 text-amber-800"}`}>
                          {apt.status}
                        </span>
                        <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${apt.paymentStatus === "Paid" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                          {apt.paymentStatus === "Paid" ? "Completed" : apt.paymentStatus || "Pending"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-extrabold text-slate-900">{apt.doctorName}</p>
                      <p className="text-[11px] text-teal-700 font-semibold">{apt.doctorSpecialty} · {apt.doctorRoom}</p>
                      <p className="mt-1 text-xs font-bold text-slate-700">{apt.appointmentDate} at {apt.appointmentTime}</p>
                      <p className="text-[11px] text-slate-500">{apt.visitType}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-base font-black text-slate-900">PKR {apt.fee?.toLocaleString()}</p>
                      <div className="flex items-center gap-2">
                        {apt.prescription && (
                          <button
                            onClick={() => setViewPrescription(apt)}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                          >
                            <FileText className="h-3.5 w-3.5 text-teal-600" /> View Rx
                          </button>
                        )}
                        <a
                          href={buildWhatsAppLink(settings.whatsapp, defaultWhatsAppMessages.askAboutAppointment(settings.clinicName, apt.appointmentNumber))}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white"
                        >
                          <MessageCircle className="h-3.5 w-3.5" /> Ask
                        </a>
                      </div>
                    </div>
                  </div>
                  {apt.doctorNotes && (
                    <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3 text-[11px] text-blue-900">
                      <span className="font-bold">Doctor notes: </span>{apt.doctorNotes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* PROFILE */}
        {activeTab === "profile" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Personal Information</h3>
              {!editMode ? (
                <button
                  onClick={() => { setEditMode(true); setEditError(""); }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit Profile
                </button>
              ) : (
                <button
                  onClick={() => { setEditMode(false); setForm(account); setEditError(""); }}
                  className="text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
              )}
            </div>

            {editError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
                <AlertCircle className="h-4 w-4 shrink-0" /> {editError}
              </div>
            )}

            {editMode ? (
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block font-bold text-slate-700">First Name *</label>
                    <input value={form.firstName || ""} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required className={InputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block font-bold text-slate-700">Last Name *</label>
                    <input value={form.lastName || ""} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required className={InputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block font-bold text-slate-700">CNIC</label>
                    <input value={form.cnic || ""} onChange={(e) => setForm({ ...form, cnic: e.target.value })} placeholder="35202-1234567-1" className={InputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block font-bold text-slate-700">Email</label>
                    <input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} className={InputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1 block font-bold text-slate-700">Gender</label>
                    <select value={form.gender || "Male"} onChange={(e) => setForm({ ...form, gender: e.target.value })} className={InputCls}>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block font-bold text-slate-700">Blood Group</label>
                    <select value={form.bloodGroup || ""} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} className={InputCls}>
                      <option value="">—</option>
                      {BLOOD_GROUPS.map((b) => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block font-bold text-slate-700">Date of Birth</label>
                    <input type="date" value={form.dateOfBirth || ""} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} className={InputCls} />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">City</label>
                  <input value={form.city || ""} onChange={(e) => setForm({ ...form, city: e.target.value })} className={InputCls} />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Address</label>
                  <input value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} className={InputCls} />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Emergency Contact</label>
                  <input value={form.emergencyContact || ""} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} className={InputCls} />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Known Allergies</label>
                  <input value={form.allergies || ""} onChange={(e) => setForm({ ...form, allergies: e.target.value })} className={InputCls} />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">New Password (leave blank to keep current)</label>
                  <input type="password" value={form.newPassword || ""} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} placeholder="Min. 6 characters" className={InputCls} autoComplete="new-password" />
                </div>
                <button type="submit" disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A2540] px-5 py-3 text-xs font-bold text-white shadow-sm disabled:opacity-60">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            ) : (
              <dl className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-3">
                {[
                  ["Phone", account?.phone],
                  ["CNIC", account?.cnic || "—"],
                  ["Email", account?.email || "—"],
                  ["Gender", account?.gender || "—"],
                  ["Date of Birth", account?.dateOfBirth || "—"],
                  ["Blood Group", account?.bloodGroup || "—"],
                  ["City", account?.city || "—"],
                  ["Emergency Contact", account?.emergencyContact || "—"],
                  ["Allergies", account?.allergies || "None declared"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-slate-50 p-3">
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</dt>
                    <dd className="mt-1 font-semibold text-slate-900 break-all">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        )}
      </main>

      {/* Prescription Modal */}
      {viewPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-5 py-4">
              <div>
                <h4 className="font-extrabold text-slate-900">Prescription</h4>
                <p className="text-[11px] text-slate-500">{viewPrescription.doctorName} · {viewPrescription.appointmentDate}</p>
              </div>
              <button onClick={() => setViewPrescription(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {viewPrescription.doctorNotes && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-blue-600">Clinical Notes</p>
                  <p className="text-xs leading-relaxed text-blue-900">{viewPrescription.doctorNotes}</p>
                </div>
              )}
              {viewPrescription.prescription && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Medicines & Dosage</p>
                  <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-700">{viewPrescription.prescription}</pre>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <p className="text-[11px] text-slate-400">Keep this prescription safe for follow-ups.</p>
                <button onClick={() => window.print()} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Print</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer settings={settings} onOpenBooking={() => { window.location.href = "/book"; }} onOpenTracker={() => { window.location.href = "/track"; }} />
    </div>
  );
}
