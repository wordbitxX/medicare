import type { Metadata } from "next";
import PublicPortalPage from "@/components/public/PublicPortalPage";
import { getPublicClinicDataSafe } from "@/lib/clinic-data";
import DbErrorNotice from "@/components/public/DbErrorNotice";

export const metadata: Metadata = {
  title: "85+ PMDC-Registered Specialist Doctors in Lahore",
  description:
    "Browse PMDC-registered consultants in Lahore: general physician, cardiologist, dermatologist, dental surgeon, pediatrician, eye specialist, gynecologist, orthopedic surgeon, ENT specialist, neurologist, psychiatrist, urologist, gastroenterologist & physiotherapist. View qualifications, fees, OPD days & room — book online in one click.",
  keywords: [
    "best doctors in Lahore",
    "specialist doctor Lahore",
    "PMDC registered doctors Lahore",
    "list of doctors in Lahore",
    "doctor directory Lahore",
    "consultant physician Gulberg",
    "cardiologist in Lahore",
    "dermatologist in Lahore",
    "dental surgeon Lahore",
    "pediatrician in Lahore",
    "orthopedic surgeon Lahore",
    "gynecologist in Lahore",
    "eye specialist Lahore",
    "physiotherapist Lahore",
    "ENT specialist Lahore",
    "neurologist Lahore",
    "psychiatrist Lahore",
    "urologist Lahore",
    "gastroenterologist Lahore",
    "female doctor in Lahore",
    "male doctor in Lahore",
    "online doctor appointment Lahore",
  ],
  alternates: { canonical: "/doctors" },
  openGraph: { url: "/doctors", title: "Specialist Doctors in Lahore | Medicare Plus" },
};

export const dynamic = "force-dynamic";

export default async function DoctorsPage() {
  const result = await getPublicClinicDataSafe();
  if (!result.ok) return <DbErrorNotice detail={result.detail} />;
  const data = result.data;
  return <PublicPortalPage view="doctors" {...data} />;
}
