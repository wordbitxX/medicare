"use client";

import React, { useEffect, useState } from "react";
import {
  ClinicSettingsType,
  DoctorType,
  ServiceType,
  ReviewType,
  BlogPostType,
  FaqType,
} from "@/types";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import HomeStats from "./HomeStats";
import ServicesSection from "./ServicesSection";
import HomeLuxurySection from "./HomeLuxurySection";
import ReviewsSection from "./ReviewsSection";
import HomeCTA from "./HomeCTA";
import HomeBlogPreview from "./HomeBlogPreview";
import Footer from "./Footer";
import FloatingWhatsApp from "./FloatingWhatsApp";
import WordbitxPromo from "./WordbitxPromo";

interface ClientClinicLandingProps {
  initialSettings: ClinicSettingsType;
  doctors: DoctorType[];
  services: ServiceType[];
  reviews: ReviewType[];
  blogPosts: BlogPostType[];
  faqs: FaqType[];
}

export default function ClientClinicLanding({
  initialSettings,
  doctors,
  services,
  reviews,
  blogPosts,
}: ClientClinicLandingProps) {
  const [settings] = useState<ClinicSettingsType>(initialSettings);

  const handleOpenBooking = () => {
    window.location.href = "/book";
  };

  const handleSelectDoctorToBook = (doctorId: number) => {
    window.location.href = `/book?doctor=${doctorId}`;
  };

  const handleSelectServiceToBook = (serviceId: number) => {
    window.location.href = `/book?service=${serviceId}`;
  };

  // Scroll-reveal: sections fade up as they enter the viewport
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>("main > *"));
    targets.forEach((el) => el.classList.add("reveal"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar
        settings={settings}
        onOpenBooking={handleOpenBooking}
        onOpenTracker={() => { window.location.href = "/track"; }}
      />

      <main>
        <HeroSection
          settings={settings}
          doctors={doctors}
          services={services}
          onOpenBooking={handleOpenBooking}
          onSelectDoctorToBook={handleSelectDoctorToBook}
          onSwitchPreset={async () => {}}
        />

        <HomeStats />

        <ServicesSection
          services={services.slice(0, 6)}
          settings={settings}
          onSelectServiceToBook={handleSelectServiceToBook}
        />

        <HomeLuxurySection settings={settings} onOpenBooking={handleOpenBooking} />

        <ReviewsSection initialReviews={reviews.slice(0, 3)} />

        <HomeBlogPreview posts={blogPosts} />

        <HomeCTA settings={settings} onOpenBooking={handleOpenBooking} />

        <WordbitxPromo clinicName={settings.clinicName} />
      </main>

      <Footer
        settings={settings}
        onOpenBooking={handleOpenBooking}
        onOpenTracker={() => { window.location.href = "/track"; }}
      />

      <div className="hidden sm:block">
        <FloatingWhatsApp
          clinicName={settings.clinicName}
          whatsappNumber={settings.whatsapp}
          emergencyPhone={settings.emergencyPhone}
          onOpenBooking={handleOpenBooking}
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center gap-2.5 border-t border-slate-200 bg-white/95 p-2.5 px-4 shadow-2xl backdrop-blur-md sm:hidden">
        <a
          href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
            `Hello ${settings.clinicName}! I would like to book an appointment.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-xl bg-emerald-600 px-3 py-3 text-center text-xs font-bold text-white shadow-md"
        >
          WhatsApp Us
        </a>
        <button
          onClick={handleOpenBooking}
          className="flex-1 rounded-xl bg-teal-600 px-3 py-3 text-xs font-extrabold text-white shadow-md"
        >
          Book Appointment
        </button>
      </div>

    </div>
  );
}
