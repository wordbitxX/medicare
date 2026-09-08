import type { Metadata } from "next";
import PublicPortalPage from "@/components/public/PublicPortalPage";
import { getPublicClinicDataSafe } from "@/lib/clinic-data";
import DbErrorNotice from "@/components/public/DbErrorNotice";

export const metadata: Metadata = {
  title: "Health Blog — Doctor-Authored Guides for Pakistan",
  description:
    "Evidence-based health guidance from our consultants for Pakistani families: diabetes management, hypertension control, blood pressure, cholesterol, back pain, acne and skin care, child vaccination schedules, eye strain relief, physiotherapy exercises, dental care tips, nutrition, and mental health awareness in Lahore.",
  keywords: [
    "Pakistan health blog",
    "doctor health advice Pakistan",
    "diabetes guide Pakistan",
    "hypertension diet Pakistan",
    "high blood pressure treatment Pakistan",
    "cholesterol diet Pakistan",
    "back pain home remedies Urdu",
    "physiotherapy exercises at home",
    "acne treatment Pakistan",
    "skin care tips dermatologist",
    "child vaccination schedule Pakistan",
    "EPI vaccine schedule Pakistan",
    "eye strain relief tips",
    "computer vision syndrome Pakistan",
    "dental care tips Pakistan",
    "teeth scaling benefits",
    "nutrition guide Pakistan",
    "mental health awareness Pakistan",
    "anxiety depression help Lahore",
    "diabetes myths Pakistan",
  ],
  alternates: { canonical: "/blog" },
  openGraph: { url: "/blog", title: "Health Guides by Doctors | Medicare Plus Lahore" },
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const result = await getPublicClinicDataSafe();
  if (!result.ok) return <DbErrorNotice detail={result.detail} />;
  const data = result.data;
  return <PublicPortalPage view="blog" {...data} />;
}
