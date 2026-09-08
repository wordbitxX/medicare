import type { Metadata } from "next";
import PublicPortalPage from "@/components/public/PublicPortalPage";
import { getPublicClinicDataSafe } from "@/lib/clinic-data";
import DbErrorNotice from "@/components/public/DbErrorNotice";

export const metadata: Metadata = {
  title: "Medical Services & PKR Pricing in Lahore",
  description:
    "Transparent pricing on general consultation, cardiology ECG, ECHO, Holter, dental scaling, root canal, implants, skin treatments, PRP, laser, pediatric vaccination, eye exam, cataract, physiotherapy sessions, X-ray, ultrasound & lab tests in Lahore. Compare fees and book online instantly.",
  keywords: [
    "medical services Lahore",
    "clinic treatment prices Lahore",
    "doctor consultation fee Lahore",
    "dental treatment price Lahore",
    "root canal price Lahore",
    "dental implant price Lahore",
    "dermatology services Lahore",
    "PRP treatment price Lahore",
    "laser hair removal price Lahore",
    "cardiology ECG Lahore",
    "ECG test price Lahore",
    "ECHO test Lahore",
    "physiotherapy session price Lahore",
    "X-ray price Lahore",
    "ultrasound price Lahore",
    "blood test price Lahore",
    "health checkup package Lahore",
    "vaccination clinic Lahore",
  ],
  alternates: { canonical: "/services" },
  openGraph: { url: "/services", title: "Medical Services & Prices | Medicare Plus Lahore" },
};

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const result = await getPublicClinicDataSafe();
  if (!result.ok) return <DbErrorNotice detail={result.detail} />;
  const data = result.data;
  return <PublicPortalPage view="services" {...data} />;
}
