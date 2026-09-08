"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  CalendarDays,
  Clock3,
  Headphones,
  MapPin,
  Menu,
  MessageCircle,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { ClinicSettingsType } from "@/types";
import { buildWhatsAppLink, defaultWhatsAppMessages } from "@/lib/whatsapp";

interface NavbarProps {
  settings: ClinicSettingsType;
  onOpenBooking: () => void;
  onOpenTracker: () => void;
}

const publicLinks: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/doctors", label: "Doctors" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/track", label: "Track" },
  { href: "/contact", label: "Contact" },
  { href: "/patient", label: "My Portal" },
];

export default function Navbar({ settings, onOpenBooking, onOpenTracker }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const waLink = buildWhatsAppLink(
    settings.whatsapp,
    defaultWhatsAppMessages.chat(settings.clinicName)
  );

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Slim info strip - hidden on small screens to reduce clutter */}
      <div className="hidden border-b border-white/10 bg-[#071a2c] text-[11px] text-slate-300 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4 lg:gap-6">
            <span className="flex shrink-0 items-center gap-2 whitespace-nowrap font-semibold text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              OPD open today
            </span>
            <span className="hidden items-center gap-1.5 whitespace-nowrap lg:flex">
              <Clock3 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
              {settings.openingHoursWeekday}
            </span>
            <span className="hidden items-center gap-1.5 whitespace-nowrap xl:flex">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
              {settings.city}, Pakistan
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-3 sm:gap-5">
            <a
              href={`tel:${settings.emergencyPhone.replace(/\s+/g, "")}`}
              className="flex items-center gap-1.5 whitespace-nowrap font-semibold text-slate-200 transition hover:text-white"
            >
              <Headphones className="h-3.5 w-3.5 shrink-0 text-rose-400" />
              Emergency: {settings.emergencyPhone}
            </a>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 whitespace-nowrap font-bold text-emerald-300 transition hover:text-emerald-200"
            >
              <MessageCircle className="h-3.5 w-3.5 shrink-0" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Main nav bar */}
      <div
        className={`border-b transition-all duration-300 ${
          scrolled
            ? "border-slate-200 bg-white/95 py-2.5 shadow-[0_8px_30px_rgba(15,23,42,0.07)] backdrop-blur-xl"
            : "border-slate-200/80 bg-white py-3"
        }`}
      >
        <div className="mx-auto flex min-w-0 max-w-7xl items-center justify-between gap-2 px-3 sm:gap-3 sm:px-6 lg:gap-5 lg:px-8">
          {/* Brand lockup */}
          <Link href="/" className="group flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden" aria-label={`${settings.clinicName} home`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#0a2942] text-emerald-300 shadow-[0_8px_20px_rgba(7,26,44,0.22)] ring-1 ring-slate-900/10 transition group-hover:-translate-y-0.5 sm:h-11 sm:w-11">
              <Activity className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.2} />
            </div>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-[14px] font-extrabold tracking-[-0.02em] text-[#071a2c] sm:text-[17px]">
                {settings.clinicName}
              </div>
              <div className="truncate text-[9px] font-bold uppercase tracking-[0.1em] text-teal-700 sm:text-[10px]">
                {settings.tagline || "Advanced Multi-Specialty Care"}
              </div>
            </div>
          </Link>

          {/* Desktop nav links — only shown once there is comfortable room */}
          <nav className="hidden flex-nowrap items-center gap-5 lg:flex xl:gap-7" aria-label="Primary navigation">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative whitespace-nowrap py-2 text-[13px] font-semibold text-slate-600 transition after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-emerald-500 after:transition-all hover:text-[#071a2c] hover:after:w-full"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <Link
              href="/track"
              className="btn-press inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3.5 text-[11px] font-bold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"
            >
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden xl:inline">Track booking</span>
              <span className="xl:hidden">Track</span>
            </Link>
            <button
              onClick={onOpenBooking}
              className="btn-press inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full bg-[#0d8f79] px-4 text-[11px] font-extrabold text-white shadow-[0_8px_18px_rgba(13,143,121,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0b7968]"
            >
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              Book appointment
            </button>
          </div>

          {/* Mobile / tablet actions */}
          <div className="flex shrink-0 items-center gap-1.5 lg:hidden">
            <button
              onClick={onOpenBooking}
              className="btn-press shrink-0 whitespace-nowrap rounded-full bg-[#0d8f79] px-3 py-2 text-[10px] font-extrabold text-white shadow-sm sm:px-3.5 sm:text-[11px]"
            >
              Book now
            </button>
            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="shrink-0 rounded-xl border border-slate-200 p-2 text-slate-700"
              aria-label="Toggle navigation"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / tablet drawer — covers everything below lg */}
      {mobileMenuOpen && (
        <div className="animate-fade-up border-b border-slate-200 bg-white px-4 py-4 shadow-xl lg:hidden">
          <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="Mobile navigation">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl bg-slate-50 px-3 py-2.5 text-center text-xs font-bold text-slate-700 transition hover:bg-teal-50 hover:text-teal-800"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
            <Link
              href="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-[11px] font-bold text-slate-700"
            >
              <Search className="h-3.5 w-3.5" /> Track booking
            </Link>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2.5 text-[11px] font-bold text-white"
            >
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </a>
          </div>
          <a
            href={`tel:${settings.emergencyPhone.replace(/\s+/g, "")}`}
            className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 px-3 py-2.5 text-[11px] font-bold text-rose-700"
          >
            <Headphones className="h-3.5 w-3.5" /> Emergency: {settings.emergencyPhone}
          </a>
          <Link
            href="/admin/login"
            onClick={() => setMobileMenuOpen(false)}
            className="mt-3 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-slate-400"
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Staff & doctor portal
          </Link>
        </div>
      )}
    </header>
  );
}
