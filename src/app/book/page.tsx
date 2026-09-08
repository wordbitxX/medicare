import type { Metadata } from "next";
import PublicBookingPage from "@/components/public/PublicBookingPage";
import { getPublicClinicDataSafe } from "@/lib/clinic-data";
import DbErrorNotice from "@/components/public/DbErrorNotice";

export const metadata: Metadata = {
  title: "Book a Doctor Appointment Online in Lahore",
  description:
    "Book a confirmed same-day doctor appointment at Medicare Plus Clinic Lahore. Choose Morning OPD, Evening Executive or Video Telehealth shift, pick a PMDC-registered consultant, select an available OPD time slot, and receive your appointment reference instantly.",
  keywords: [
    "book doctor appointment Lahore",
    "online doctor appointment Lahore",
    "online clinic appointment Pakistan",
    "same day doctor appointment Lahore",
    "book specialist doctor Gulberg",
    "OPD booking Lahore",
    "morning OPD appointment Lahore",
    "evening executive clinic booking",
    "video consultation booking Pakistan",
    "doctor appointment near me",
    "walk in clinic booking Lahore",
    "doctor consultation fee booking Lahore",
  ],
  alternates: { canonical: "/book" },
  openGraph: { url: "/book", title: "Book a Doctor Appointment | Medicare Plus Lahore" },
};

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const result = await getPublicClinicDataSafe();
  if (!result.ok) return <DbErrorNotice detail={result.detail} />;
  const data = result.data;
  return (
    <PublicBookingPage
      settings={data.settings}
      doctors={data.doctors}
      services={data.services}
    />
  );
}
