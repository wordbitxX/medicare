"use client";

import React, { useMemo, useRef, useState } from "react";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import type { DoctorType } from "@/types";

export interface DoctorFormPayload {
  name: string;
  title: string;
  qualification: string;
  specialty: string;
  fee: number;
  experienceYears: number;
  roomNo: string;
  bio: string;
  availableDays: string;
  shiftStart: string;
  shiftEnd: string;
  slotDurationMinutes: number;
  avatarUrl: string | null;
  active: boolean;
  featured: boolean;
}

interface DoctorFormModalProps {
  title: string;
  submitLabel: string;
  initial?: Partial<DoctorType> | null;
  onClose: () => void;
  onSubmit: (payload: DoctorFormPayload) => Promise<void> | void;
  onUploadPhoto: (file: File, label: string) => Promise<string>;
}

const DAY_OPTIONS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function DoctorFormModal({
  title,
  submitLabel,
  initial,
  onClose,
  onSubmit,
  onUploadPhoto,
}: DoctorFormModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [titlePrefix, setTitlePrefix] = useState(initial?.title ?? "Dr.");
  const [qualification, setQualification] = useState(initial?.qualification ?? "");
  const [specialty, setSpecialty] = useState(initial?.specialty ?? "");
  const [fee, setFee] = useState<string>(String(initial?.fee ?? 3000));
  const [experienceYears, setExperienceYears] = useState<string>(String(initial?.experienceYears ?? 10));
  const [roomNo, setRoomNo] = useState(initial?.roomNo ?? "OPD Suite 105");
  const [bio, setBio] = useState(initial?.bio ?? "Senior specialist consultant with international fellowship experience.");
  const [shiftStart, setShiftStart] = useState(initial?.shiftStart ?? "10:00 AM");
  const [shiftEnd, setShiftEnd] = useState(initial?.shiftEnd ?? "04:00 PM");
  const [slotDurationMinutes, setSlotDurationMinutes] = useState<string>(String(initial?.slotDurationMinutes ?? 20));
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initial?.avatarUrl ?? null);
  const [days, setDays] = useState<string[]>(() => {
    const list = (initial?.availableDays || "Mon,Tue,Wed,Thu,Fri").split(",").map((d) => d.trim()).filter(Boolean);
    return list.length ? list : ["Mon", "Tue", "Wed", "Thu", "Fri"];
  });
  const [active, setActive] = useState<boolean>(initial?.active ?? true);
  const [featured, setFeatured] = useState<boolean>(initial?.featured ?? false);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const initials = useMemo(() => {
    return name
      .replace(/^Dr\.?\s*/i, "")
      .split(" ")
      .filter((w) => w.length > 1)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "MD";
  }, [name]);

  const toggleDay = (day: string) => {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const url = await onUploadPhoto(file, name || "doctor");
      setAvatarUrl(url);
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !specialty.trim() || !qualification.trim()) {
      setSaveError("Doctor name, specialty and qualifications are required.");
      return;
    }
    if (days.length === 0) {
      setSaveError("Please select at least one available day.");
      return;
    }
    setSaveError("");
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        title: titlePrefix.trim() || "Dr.",
        qualification: qualification.trim(),
        specialty: specialty.trim(),
        fee: Number(fee) || 0,
        experienceYears: Number(experienceYears) || 0,
        roomNo: roomNo.trim(),
        bio: bio.trim(),
        availableDays: days.join(","),
        shiftStart: shiftStart.trim(),
        shiftEnd: shiftEnd.trim(),
        slotDurationMinutes: Number(slotDurationMinutes) || 20,
        avatarUrl: avatarUrl && avatarUrl.trim() ? avatarUrl.trim() : null,
        active,
        featured,
      });
    } catch (err: any) {
      setSaveError(err.message || "Failed to save doctor");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-start justify-center p-4 pt-12">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <h4 className="font-extrabold text-slate-900 text-base">{title}</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage photo, qualifications, schedule and consultation fee for this doctor.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Photo */}
          <div className="flex items-start gap-5">
            <div className="relative w-24 h-28 rounded-2xl overflow-hidden bg-slate-100 shadow-inner shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover object-top" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-900 text-teal-300 text-lg font-black">
                  {initials}
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-slate-700 font-bold block">Doctor Photo</label>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Upload a professional portrait (JPG, PNG or WebP, up to 4 MB). You can also paste an image URL.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold shadow-xs disabled:opacity-60"
                >
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  {uploading ? "Uploading..." : "Upload Photo"}
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl(null)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-[11px] font-bold hover:bg-slate-50"
                  >
                    <X className="w-3.5 h-3.5" /> Remove Photo
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <input
                type="text"
                inputMode="url"
                value={avatarUrl ?? ""}
                onChange={(e) => setAvatarUrl(e.target.value || null)}
                placeholder="/uploads/doctors/photo.jpg or https://..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
              {avatarUrl && (
                <p className="text-[10px] text-emerald-600 font-semibold">
                  ✓ Photo attached — click Save to apply.
                </p>
              )}
              {uploadError && (
                <p className="text-[11px] text-rose-600 font-semibold">{uploadError}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-slate-700 font-bold block mb-1">Title</label>
              <input
                value={titlePrefix}
                onChange={(e) => setTitlePrefix(e.target.value)}
                placeholder="Dr."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
              />
            </div>
            <div className="col-span-2">
              <label className="text-slate-700 font-bold block mb-1">Full Name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Dr. Asim Jamil"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-700 font-bold block mb-1">Specialty *</label>
              <input
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                required
                placeholder="e.g. Cardiology"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
              />
            </div>
            <div>
              <label className="text-slate-700 font-bold block mb-1">Qualification *</label>
              <input
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                required
                placeholder="MBBS, FCPS"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-slate-700 font-bold block mb-1">Consultation Fee (PKR)</label>
              <input
                type="number"
                min={0}
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
              />
            </div>
            <div>
              <label className="text-slate-700 font-bold block mb-1">Experience (Yrs)</label>
              <input
                type="number"
                min={0}
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
              />
            </div>
            <div>
              <label className="text-slate-700 font-bold block mb-1">Room / OPD</label>
              <input
                value={roomNo}
                onChange={(e) => setRoomNo(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-slate-700 font-bold block mb-1">Shift Start</label>
              <input
                value={shiftStart}
                onChange={(e) => setShiftStart(e.target.value)}
                placeholder="09:00 AM"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
              />
            </div>
            <div>
              <label className="text-slate-700 font-bold block mb-1">Shift End</label>
              <input
                value={shiftEnd}
                onChange={(e) => setShiftEnd(e.target.value)}
                placeholder="05:00 PM"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
              />
            </div>
            <div>
              <label className="text-slate-700 font-bold block mb-1">Slot Duration</label>
              <input
                type="number"
                min={5}
                value={slotDurationMinutes}
                onChange={(e) => setSlotDurationMinutes(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-700 font-bold block mb-2">Available Days</label>
            <div className="flex flex-wrap gap-2">
              {DAY_OPTIONS.map((day) => {
                const active = days.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition ${
                      active
                        ? "bg-teal-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-slate-700 font-bold block mb-1">Short Biography</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 accent-teal-600"
              />
              <span className="text-slate-700 font-bold">Show doctor on public website</span>
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 accent-teal-600"
              />
              <span className="text-slate-700 font-bold">Feature on homepage</span>
            </label>
          </div>

          {saveError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700 text-[11px] font-semibold">
              {saveError}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
              {submitting ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
