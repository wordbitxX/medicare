"use client";

import React from "react";
import Link from "next/link";
import { Activity, Phone, MessageCircle, Mail, MapPin, Shield, ExternalLink, Code2, ArrowRight } from "lucide-react";
import { ClinicSettingsType } from "@/types";
import { buildWhatsAppLink, defaultWhatsAppMessages } from "@/lib/whatsapp";
import { WORDBITX } from "@/lib/wordbitx";

interface FooterProps {
  settings: ClinicSettingsType;
  onOpenBooking: () => void;
  onOpenTracker: () => void;
}

export default function Footer({ settings, onOpenBooking, onOpenTracker }: FooterProps) {
  const waLink = buildWhatsAppLink(
    settings.whatsapp,
    defaultWhatsAppMessages.chat(settings.clinicName)
  );

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1 & 2: Clinic Brand & About */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-extrabold text-white text-lg tracking-tight leading-tight">
                  {settings.clinicName}
                </span>
                <span className="block text-[10px] font-extrabold uppercase tracking-[0.14em] text-teal-300">
                  {settings.tagline || "WordbitX Specialty Care"}
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {settings.aboutText}
            </p>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>{settings.phone} • Emergency: {settings.emergencyPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>{settings.email}</span>
              </div>
            </div>
          </div>

          {/* Col 3: Quick Navigation */}
          <div>
            <h4 className="font-bold text-white text-sm mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/services" className="hover:text-teal-400 transition-colors">Services & Treatments</Link></li>
              <li><Link href="/doctors" className="hover:text-teal-400 transition-colors">Specialist Doctors</Link></li>
              <li><Link href="/about" className="hover:text-teal-400 transition-colors">About the Clinic</Link></li>
              <li><Link href="/blog" className="hover:text-teal-400 transition-colors">Health Articles</Link></li>
              <li><Link href="/track" className="hover:text-teal-400 transition-colors">Track Appointment</Link></li>
              <li><Link href="/contact" className="hover:text-teal-400 transition-colors">Location, FAQs & Contact</Link></li>
              <li><Link href="/book" className="hover:text-teal-400 transition-colors">Book Appointment</Link></li>
            </ul>
          </div>

          {/* Col 4: Medical Specialties */}
          <div>
            <h4 className="font-bold text-white text-sm mb-3">Specialties</h4>
            <ul className="space-y-2 text-xs">
              <li>Cardiology</li>
              <li>Orthopedics & Joints</li>
              <li>Pediatrics & Child Care</li>
              <li>Dermatology & Aesthetics</li>
              <li>Ophthalmology / Eye Care</li>
              <li>Gynecology & Obstetrics</li>
              <li>ENT & Pulmonology</li>
              <li>General Surgery</li>
            </ul>
          </div>

          {/* Col 5: Patient + WordbitX contact */}
          <div>
            <h4 className="font-bold text-white text-sm mb-3">Patient Portal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/track" className="hover:text-teal-400 transition-colors">
                  Track Existing Appointment
                </Link>
              </li>
              <li>
                <button onClick={onOpenBooking} className="hover:text-teal-400 transition-colors">
                  Book New Appointment
                </button>
              </li>
              <li>
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition-colors">
                  Live WhatsApp Assistance
                </a>
              </li>
              <li className="pt-2">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold"
                >
                  <Shield className="w-3 h-3 text-teal-400" />
                  <span>Staff & Doctor Login</span>
                </Link>
              </li>
            </ul>

            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <h4 className="font-bold text-blue-300 text-xs mb-2 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" />
                {WORDBITX.companyName}
              </h4>
              <ul className="space-y-1.5 text-[11px] text-slate-400">
                <li className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-blue-400 shrink-0" />
                  <a href={WORDBITX.phoneHref} className="hover:text-blue-300 transition-colors">{WORDBITX.phone}</a>
                </li>
                <li className="flex items-center gap-1.5">
                  <MessageCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                  <a href={WORDBITX.whatsappHref} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300 transition-colors">WhatsApp</a>
                </li>
                <li className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-blue-400 shrink-0" />
                  <a href={WORDBITX.emailHref} className="hover:text-blue-300 transition-colors">{WORDBITX.email}</a>
                </li>
                <li className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                  <span>{WORDBITX.headOffice}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <ExternalLink className="w-3 h-3 text-blue-400 shrink-0" />
                  <a href={WORDBITX.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition-colors">wordbitxtech.com</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>© {new Date().getFullYear()} {settings.clinicName}. All rights reserved.</div>
          <a
            href={WORDBITX.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-blue-300 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Developed & maintained by <span className="font-bold text-blue-300">WordbitX Software Company</span></span>
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
