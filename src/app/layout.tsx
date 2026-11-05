import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SITE_URL as siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Medicare Plus Clinic",
  title: {
    default: "Medicare Plus Clinic Lahore | Specialist Doctors & Online Appointments",
    template: "%s | Medicare Plus Clinic Lahore",
  },
  description:
    "Book verified specialist doctors in Lahore — general physician, cardiologist, dermatologist, dental surgeon, pediatrician, eye specialist, gynecologist, orthopedist & physiotherapist. Same-day OPD, online video consultation, transparent PKR fees and WhatsApp confirmation at Medicare Plus.",
  keywords: [
    // Core clinic intent
    "best clinic in Lahore",
    "multi specialty clinic Lahore",
    "clinic near me Lahore",
    "hospital in Gulberg Lahore",
    "private clinic Lahore",
    "best hospital in Pakistan",
    "clinic in Pakistan",
    "hospital near me Pakistan",
    "online doctor Pakistan",
    "doctor appointment Pakistan",
    "medical clinic Pakistan",
    "health checkup Pakistan",
    "telemedicine app Pakistan",
    // Doctor & specialist intent
    "specialist doctors in Lahore",
    "best doctor in Lahore",
    "general physician Gulberg Lahore",
    "cardiologist in Lahore",
    "dermatologist in Gulberg Lahore",
    "skin specialist Lahore",
    "best dental clinic Lahore",
    "dental surgeon Lahore",
    "pediatrician in Lahore",
    "child specialist Lahore",
    "eye specialist Lahore",
    "ophthalmologist Lahore",
    "gynecologist in Lahore",
    "orthopedic doctor Lahore",
    "physiotherapy clinic Lahore",
    "ENT specialist Lahore",
    "gastroenterologist Lahore",
    "urologist Lahore",
    "psychiatrist Lahore",
    "neurologist in Lahore",
    "nutritionist Lahore",
    "rheumatologist Lahore",
    "pulmonologist Lahore",
    "nephrologist Lahore",
    "oncologist Lahore",
    "dentist near me Lahore",
    "doctor near me Lahore",
    // Appointments & consultations
    "online doctor appointment Lahore",
    "book doctor appointment online Pakistan",
    "same day doctor appointment Lahore",
    "video consultation doctor Pakistan",
    "online video consultation Lahore",
    "telehealth Pakistan",
    "OPD appointment Lahore",
    "morning OPD Lahore",
    "evening clinic Lahore",
    "doctor consultation fee Lahore",
    "PMDC registered doctors Lahore",
    // Tests & services
    "health checkup packages Lahore",
    "whole body checkup Lahore",
    "diagnostic tests Lahore",
    "blood test lab Lahore",
    "X-ray clinic Lahore",
    "ECG test Lahore",
    "ultrasound scan Lahore",
    // Disease & condition queries
    "blood pressure doctor Lahore",
    "diabetes specialist Lahore",
    "hypertension treatment Lahore",
    "back pain physiotherapy Lahore",
    "migraine doctor Lahore",
    "anxiety depression doctor Lahore",
    "acne treatment dermatologist Lahore",
    // Healthcare-tech / platform-intent (serves WordbitX brand)
    "clinic management system Pakistan",
    "hospital management software Pakistan",
    "hospital management system Pakistan",
    "clinic website developer Pakistan",
    "hospital website development Pakistan",
    "medical booking system Pakistan",
    "patient portal software Pakistan",
    "healthcare software Pakistan",
    "telemedicine platform Pakistan",
  ],
  authors: [{ name: "Medicare Plus Clinical Team", url: siteUrl }],
  creator: "WordbitX Software Company",
  publisher: "Medicare Plus Clinic",
  category: "Healthcare",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: "/",
    siteName: "Medicare Plus Clinic Lahore",
    title: "Medicare Plus Clinic Lahore | Specialist Care Without the Wait",
    description:
      "Consult PMDC-registered specialists in Lahore with transparent fees, confirmed timings and WhatsApp support.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Medicare Plus Lahore",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Medicare Plus Clinic Lahore",
    description:
      "Specialist medical, dental and diagnostic care with same-day online appointments in Lahore.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-PK" className="scroll-smooth">
      <body className="min-h-screen bg-white text-slate-900 antialiased">{children}</body>
    </html>
  );
}
