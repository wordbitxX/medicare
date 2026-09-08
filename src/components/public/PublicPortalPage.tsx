"use client";

import React, { useState } from "react";
import {
  ClinicSettingsType,
  DoctorType,
  ServiceType,
  ReviewType,
  BlogPostType,
  FaqType,
} from "@/types";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingWhatsApp from "./FloatingWhatsApp";
import ServicesSection from "./ServicesSection";
import DoctorsSection from "./DoctorsSection";
import DepartmentsSection from "./DepartmentsSection";
import WhyChooseUsSection from "./WhyChooseUsSection";
import CostEstimator from "./CostEstimator";
import ReviewsSection from "./ReviewsSection";
import BlogSection from "./BlogSection";
import FAQSection from "./FAQSection";
import ContactSection from "./ContactSection";
import WordbitxBand from "./WordbitxBand";
import { Activity, ArrowRight, Calendar, HeartHandshake, ShieldCheck } from "lucide-react";
import PublicCollectionStructuredData from "@/components/seo/PublicCollectionStructuredData";

interface PublicPortalPageProps {
  view: "services" | "doctors" | "about" | "blog" | "contact";
  settings: ClinicSettingsType;
  doctors: DoctorType[];
  services: ServiceType[];
  reviews: ReviewType[];
  blogPosts: BlogPostType[];
  faqs: FaqType[];
}

const pageCopy = {
  services: {
    eyebrow: "Clinical departments & transparent pricing",
    title: "Medical services built around your family",
    subtitle:
      "Explore consultations, procedures and diagnostic packages with clear PKR pricing, visit duration and preparation guidelines.",
  },
  doctors: {
    eyebrow: "PMDC-registered consultant panel",
    title: "Meet the specialists leading your care",
    subtitle:
      "Compare expertise, qualifications, consultation schedules and fees before reserving your preferred appointment.",
  },
  about: {
    eyebrow: "Consultant-led care since 2022",
    title: "A modern clinic designed around better outcomes",
    subtitle:
      "Medicare Plus combines experienced clinical faculty, dependable diagnostics and a calm patient experience under one roof in Lahore.",
  },
  blog: {
    eyebrow: "Evidence-based health education",
    title: "Practical medical guidance from our doctors",
    subtitle:
      "Read concise, locally relevant guidance on heart health, diabetes, dental care, dermatology, pediatrics and rehabilitation.",
  },
  contact: {
    eyebrow: "We are ready to help",
    title: "Contact the clinic or plan your visit",
    subtitle:
      "Reach reception by phone or WhatsApp, submit an inquiry, or review our address and OPD opening hours.",
  },
};

export default function PublicPortalPage({
  view,
  settings,
  doctors,
  services,
  reviews,
  blogPosts,
  faqs,
}: PublicPortalPageProps) {

  const openBooking = () => {
    window.location.href = "/book";
  };

  const copy = pageCopy[view];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicCollectionStructuredData
        view={view}
        settings={settings}
        doctors={doctors}
        services={services}
        faqs={faqs}
      />
      <Navbar
        settings={settings}
        onOpenBooking={openBooking}
        onOpenTracker={() => { window.location.href = "/track"; }}
      />

      <main>
        <section className="relative overflow-hidden bg-[#0b1e31] py-16 text-white md:py-20">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "30px 30px",
            }}
          />
          <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-[100px]" />
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                {copy.eyebrow}
              </div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
                {copy.title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60 md:text-base">
                {copy.subtitle}
              </p>
            </div>
          </div>
        </section>

        {view === "services" && (
          <>
            <ServicesSection
              services={services}
              settings={settings}
              onSelectServiceToBook={(id) => {
                window.location.href = `/book?service=${id}`;
              }}
            />
            <CostEstimator services={services} settings={settings} onOpenBooking={openBooking} />
          </>
        )}

        {view === "doctors" && (
          <>
            <DoctorsSection
              doctors={doctors}
              settings={settings}
              onSelectDoctorToBook={(id) => {
                window.location.href = `/book?doctor=${id}`;
              }}
            />
            <ReviewsSection initialReviews={reviews.slice(0, 6)} />
          </>
        )}

        {view === "about" && (
          <>
            <section className="border-b border-slate-200 bg-white py-16 md:py-20">
              <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-teal-700">
                    Our clinical mission
                  </div>
                  <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-slate-900">
                    Good healthcare should be clear, timely and personal.
                  </h2>
                  <p className="mt-5 text-sm leading-7 text-slate-600">{settings.aboutText}</p>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    Our clinical teams follow evidence-based treatment protocols while making every
                    consultation understandable. Patients receive transparent fees, a confirmed
                    appointment time, digital records and direct follow-up support.
                  </p>
                  <button
                    onClick={openBooking}
                    className="mt-7 inline-flex items-center gap-2 rounded-full bg-teal-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-700"
                  >
                    <Calendar className="h-4 w-4" />
                    Book a consultation
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-lg">
                    <img
                      src="https://images.pexels.com/photos/7195121/pexels-photo-7195121.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1000&h=640"
                      alt={`Clinical team at ${settings.clinicName}`}
                      className="h-56 w-full object-cover sm:h-64"
                      loading="lazy"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      ["25,000+", "Patients treated"],
                      ["85+", "Senior specialists"],
                      ["27", "Clinical departments"],
                      ["4.9/5", "Average rating"],
                    ].map(([value, label]) => (
                      <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="text-2xl font-semibold text-slate-900 sm:text-3xl">{value}</div>
                        <div className="mt-1 text-xs font-semibold text-slate-500">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            <DepartmentsSection settings={settings} onOpenBooking={openBooking} />
            <WhyChooseUsSection />
            <FAQSection faqs={faqs} settings={settings} />
            <WordbitxBand
              clinicName={settings.clinicName}
              heading="This platform was designed and built by WordbitX Software Company"
              description="WordbitX builds hospital management systems, clinic portals, booking engines and medical store software for healthcare businesses across Pakistan — with full source-code ownership handed to you."
            />
          </>
        )}

        {view === "blog" && (
          <BlogSection
            initialPosts={blogPosts}
            settings={settings}
            onOpenBooking={openBooking}
          />
        )}

        {view === "contact" && (
          <>
            <ContactSection settings={settings} services={services} />
            <FAQSection faqs={faqs.slice(0, 8)} settings={settings} />
            <WordbitxBand clinicName={settings.clinicName} />
          </>
        )}
      </main>

      <Footer
        settings={settings}
        onOpenBooking={openBooking}
        onOpenTracker={() => { window.location.href = "/track"; }}
      />

      <FloatingWhatsApp
        clinicName={settings.clinicName}
        whatsappNumber={settings.whatsapp}
        emergencyPhone={settings.emergencyPhone}
        onOpenBooking={openBooking}
      />

    </div>
  );
}
