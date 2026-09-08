"use client";

import React, { useState } from "react";
import {
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { ClinicSettingsType, ServiceType } from "@/types";
import { buildWhatsAppLink, defaultWhatsAppMessages } from "@/lib/whatsapp";

interface ContactSectionProps {
  settings: ClinicSettingsType;
  services: ServiceType[];
}

export default function ContactSection({ settings, services }: ContactSectionProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [serviceInterested, setServiceInterested] = useState(services[0]?.name || "General Medicine");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setErrorMsg("Please enter your name and phone number.");
      return;
    }
    setErrorMsg("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          serviceInterested,
          source: "Website Contact Form",
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(
          "Thank you! Your inquiry has been sent to our reception desk. We will contact you shortly."
        );
        setName("");
        setPhone("");
        setEmail("");
        setNotes("");
      } else {
        throw new Error(data.error || "Failed to submit inquiry");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit. Please try contacting via WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  const contactWaLink = buildWhatsAppLink(
    settings.whatsapp,
    defaultWhatsAppMessages.chat(settings.clinicName)
  );

  return (
    <section id="contact" className="py-16 lg:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Contact Info & Timings */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold mb-2">
                <MapPin className="w-3.5 h-3.5" />
                <span>Visit Our Clinic</span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">
                Get In Touch With Us
              </h2>
              <p className="mt-2 text-slate-600 text-xs sm:text-sm">
                Have questions or need assistance? Reach out to our front desk team or visit our
                central clinic in {settings.city}.
              </p>
            </div>

            {/* Address & Contacts */}
            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <MapPin className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900">Clinic Location</h4>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">{settings.address}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Phone className="w-4 h-4 text-teal-600" />
                    <span>Reception Line</span>
                  </div>
                  <a
                    href={`tel:${settings.phone.replace(/\s+/g, "")}`}
                    className="font-bold text-slate-900 hover:text-teal-700 block"
                  >
                    {settings.phone}
                  </a>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <div className="flex items-center gap-2 text-emerald-800 mb-1">
                    <MessageCircle className="w-4 h-4 fill-emerald-600 text-white" />
                    <span>WhatsApp Desk</span>
                  </div>
                  <a
                    href={contactWaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-emerald-900 hover:underline block"
                  >
                    {settings.whatsapp}
                  </a>
                </div>
              </div>

              {/* Working Hours Card */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                <div className="flex items-center gap-2 text-teal-400 font-bold mb-1">
                  <Clock className="w-4 h-4" />
                  <span>OPD Consultation Hours</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5 text-slate-300">
                  <span>Weekdays:</span>
                  <span className="font-medium text-white">{settings.openingHoursWeekday}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5 text-slate-300">
                  <span>Saturday:</span>
                  <span className="font-medium text-white">{settings.openingHoursSaturday}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Sunday:</span>
                  <span className="font-medium text-teal-300">{settings.openingHoursSunday}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Lead Inquiry Form */}
          <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              Send Us a Message or Clinical Inquiry
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Fill out this form and our patient care coordinator will call or WhatsApp you within
              15 minutes.
            </p>

            {successMsg ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-950 text-sm">Inquiry Received</h4>
                <p className="text-xs text-emerald-800">{successMsg}</p>
                <button
                  onClick={() => setSuccessMsg("")}
                  className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shahid Rafiq"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Phone / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="03XX XXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Department / Service Needed
                    </label>
                    <select
                      value={serviceInterested}
                      onChange={(e) => setServiceInterested(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-teal-500"
                    >
                      {services.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name} ({s.category})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Your Question or Symptoms
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe your inquiry, timing request, or medical concern..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <span className="text-[11px] text-slate-500">
                    Your information is protected under clinical confidentiality.
                  </span>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-7 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? "Sending..." : "Submit Inquiry"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
