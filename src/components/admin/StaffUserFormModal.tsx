"use client";

import React, { useMemo, useState } from "react";
import type { DoctorType, StaffUserType } from "@/types";
import { X } from "lucide-react";

export interface StaffUserPayload {
  name: string;
  email: string;
  password?: string;
  role: "super_admin" | "receptionist" | "doctor";
  phone?: string | null;
  doctorId?: number | null;
  active: boolean;
}

interface StaffUserFormModalProps {
  title: string;
  submitLabel: string;
  doctors: DoctorType[];
  initial?: Partial<StaffUserType> | null;
  onClose: () => void;
  onSubmit: (payload: StaffUserPayload) => Promise<void> | void;
}

export default function StaffUserFormModal({
  title,
  submitLabel,
  doctors,
  initial,
  onClose,
  onSubmit,
}: StaffUserFormModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"super_admin" | "receptionist" | "doctor">(
    (initial?.role as "super_admin" | "receptionist" | "doctor") ?? "receptionist"
  );
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [doctorId, setDoctorId] = useState<string>(initial?.doctorId ? String(initial.doctorId) : "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const availableDoctors = useMemo(() => doctors.sort((a, b) => a.name.localeCompare(b.name)), [doctors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (!initial && !password.trim()) {
      setError("Password is required for new staff accounts.");
      return;
    }
    if (role === "doctor" && !doctorId) {
      setError("Please link a doctor profile to this account.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim() || undefined,
        role,
        phone: phone.trim() || null,
        doctorId: role === "doctor" ? Number(doctorId) : null,
        active,
      });
    } catch (err: any) {
      setError(err.message || "Failed to save staff account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-start justify-center p-4 pt-14">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <h4 className="font-extrabold text-slate-900 text-base">{title}</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Create secure credentials for a doctor, receptionist or admin account.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-bold block mb-1">Full Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900" />
            </div>
            <div>
              <label className="text-slate-700 font-bold block mb-1">Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-700 font-bold block mb-1">Role *</label>
              <select value={role} onChange={(e) => setRole(e.target.value as any)} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900">
                <option value="receptionist">Receptionist</option>
                <option value="doctor">Doctor</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div>
              <label className="text-slate-700 font-bold block mb-1">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900" />
            </div>
            <div>
              <label className="text-slate-700 font-bold block mb-1">Password {initial ? "(leave blank to keep)" : "*"}</label>
              <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900" />
            </div>
          </div>

          {role === "doctor" && (
            <div>
              <label className="text-slate-700 font-bold block mb-1">Linked Doctor Profile *</label>
              <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900">
                <option value="">Select doctor</option>
                {availableDoctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} — {doctor.specialty}
                  </option>
                ))}
              </select>
            </div>
          )}

          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 cursor-pointer">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4 accent-teal-600" />
            <span className="text-slate-700 font-bold">Account active and allowed to log in</span>
          </label>

          {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700 text-[11px] font-semibold">{error}</div>}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-60">
              {submitting ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
