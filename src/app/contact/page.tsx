import type { Metadata } from "next";
import PublicPortalPage from "@/components/public/PublicPortalPage";
import { getPublicClinicDataSafe } from "@/lib/clinic-data";
import DbErrorNotice from "@/components/public/DbErrorNotice";

export const metadata: Metadata = {
  title: "Contact Us — Location, OPD Timings & Emergency",
  description:
    "Contact Medicare Plus Clinic in Lahore. View full address, opening hours, OPD and executive clinic timings, emergency contact, and WhatsApp help details. Send a clinical inquiry online and receive a response within hours.",
  keywords: [
    "clinic contact Lahore",
    "hospital contact number Lahore",
    "clinic in Gulberg Lahore contact",
    "doctor OPD timings Lahore",
    "emergency clinic Lahore",
    "24 hour clinic Lahore",
    "clinic WhatsApp Lahore",
    "hospital location Gulberg",
    "clinic address Lahore",
    "clinic opening hours Lahore",
    "medical inquiry online Lahore",
    "health center contact Lahore",
  ],
  alternates: { canonical: "/contact" },
  openGraph: { url: "/contact", title: "Contact Medicare Plus Clinic Lahore" },
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const result = await getPublicClinicDataSafe();
  if (!result.ok) return <DbErrorNotice detail={result.detail} />;
  const data = result.data;
  return <PublicPortalPage view="contact" {...data} />;
}
