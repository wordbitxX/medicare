import type { Metadata } from "next";
import PublicPortalPage from "@/components/public/PublicPortalPage";
import { getPublicClinicDataSafe } from "@/lib/clinic-data";
import DbErrorNotice from "@/components/public/DbErrorNotice";

export const metadata: Metadata = {
  title: "About Our Multi-Specialty Clinic",
  description:
    "Learn about Medicare Plus Clinic in Gulberg III, Lahore—our PMDC-registered consultants, clinical standards, diagnostic facilities and patient-first approach.",
  keywords: [
    "Medicare Plus Clinic Lahore",
    "multi-specialty clinic Gulberg",
    "private clinic Lahore",
    "medical diagnostic clinic Pakistan",
  ],
  alternates: { canonical: "/about" },
  openGraph: { url: "/about", title: "About Medicare Plus" },
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const result = await getPublicClinicDataSafe();
  if (!result.ok) return <DbErrorNotice detail={result.detail} />;
  const data = result.data;
  return <PublicPortalPage view="about" {...data} />;
}
