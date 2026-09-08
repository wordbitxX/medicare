import type { Metadata } from "next";
import TrackAppointmentPage from "@/components/public/TrackAppointmentPage";
import { getPublicClinicData } from "@/lib/clinic-data";

export const metadata: Metadata = {
  title: "Track Your Appointment",
  description:
    "Check the status of your clinic appointment using your reference number. View consultant, date, time, room and consultation fee.",
  keywords: [
    "track appointment Lahore",
    "check appointment status Pakistan",
    "clinic appointment reference number",
  ],
  alternates: { canonical: "/track" },
  openGraph: { url: "/track", title: "Track Your Appointment | Medicare Plus Lahore" },
};

export const dynamic = "force-dynamic";

export default async function TrackPage() {
  const data = await getPublicClinicData();
  return <TrackAppointmentPage settings={data.settings} />;
}
