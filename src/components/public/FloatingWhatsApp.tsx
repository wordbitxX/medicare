"use client";

import React, { useState } from "react";
import { MessageCircle, X, Calendar, HelpCircle, Phone, ArrowUpRight } from "lucide-react";
import { buildWhatsAppLink, defaultWhatsAppMessages } from "@/lib/whatsapp";

interface FloatingWhatsAppProps {
  clinicName: string;
  whatsappNumber: string;
  emergencyPhone: string;
  onOpenBooking: () => void;
}

export default function FloatingWhatsApp({
  clinicName,
  whatsappNumber,
  emergencyPhone,
  onOpenBooking,
}: FloatingWhatsAppProps) {
  const [isOpen, setIsOpen] = useState(false);

  const chatLink = buildWhatsAppLink(
    whatsappNumber,
    defaultWhatsAppMessages.chat(clinicName)
  );

  const bookViaWaLink = buildWhatsAppLink(
    whatsappNumber,
    defaultWhatsAppMessages.book(clinicName)
  );

  const askAppointmentLink = buildWhatsAppLink(
    whatsappNumber,
    defaultWhatsAppMessages.askAboutAppointment(clinicName)
  );

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Quick Menu Popover */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200 p-4 transition-all animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
                  <MessageCircle className="w-5 h-5 fill-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Clinic WhatsApp Desk</h4>
                <p className="text-xs text-slate-500">Typically replies in under 5 minutes</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Options */}
          <div className="mt-3 space-y-2">
            <a
              href={chatLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 text-emerald-950 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                <div className="text-left">
                  <span className="text-xs font-bold block">Chat on WhatsApp</span>
                  <span className="text-[11px] text-emerald-700">Ask doctor timings, tests or fees</span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            <a
              href={bookViaWaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200/60 text-teal-950 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-teal-600" />
                <div className="text-left">
                  <span className="text-xs font-bold block">Book via WhatsApp</span>
                  <span className="text-[11px] text-teal-700">Instant reservation via chat</span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-teal-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            <a
              href={askAppointmentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-4 h-4 text-slate-600" />
                <div className="text-left">
                  <span className="text-xs font-bold block">Ask About Appointment</span>
                  <span className="text-[11px] text-slate-500">Reschedule or verify status</span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>

          {/* Emergency helpline note */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 text-red-600 font-medium">
              <Phone className="w-3 h-3" /> Emergency 24/7:
            </span>
            <a
              href={`tel:${emergencyPhone.replace(/\s+/g, "")}`}
              className="font-bold text-red-600 hover:underline"
            >
              {emergencyPhone}
            </a>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group flex items-center gap-2.5 px-4 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg shadow-emerald-700/30 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        aria-label="Contact clinic via WhatsApp"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-200"></span>
        </span>
        <MessageCircle className="w-5 h-5 fill-white" />
        <span className="text-xs font-bold hidden sm:inline-block">WhatsApp Us</span>
      </button>
    </div>
  );
}
