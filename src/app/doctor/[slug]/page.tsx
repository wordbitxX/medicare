import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { doctors } from "@/db/schema";
import { eq } from "drizzle-orm";
import PublicDoctorProfilePage from "@/components/public/PublicDoctorProfilePage";
import { getPublicClinicDataSafe } from "@/lib/clinic-data";
import DbErrorNotice from "@/components/public/DbErrorNotice";

export const dynamic = "force-dynamic";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://medicareplus.pk").replace(/\/$/, "");

const getDoctor = cache(async (slug: string) => {
  const id = Number(slug);
  if (Number.isNaN(id)) return null;
  const [doc] = await db
    .select()
    .from(doctors)
    .where(eq(doctors.id, id))
    .limit(1);
  return doc || null;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getDoctor(slug);
  if (!doc) return { title: "Doctor Not Found" };

  const name = doc.name;
  const specialty = doc.specialty;
  const title = `${name} — ${specialty} in Lahore`;
  const description = `${name}, ${doc.qualification}, is a PMDC-registered ${specialty} in Lahore with ${doc.experienceYears}+ years of experience. Consultation fee PKR ${doc.fee.toLocaleString()}. OPD on ${doc.availableDays}. Book an online appointment at Medicare Plus Clinic.`;

  return {
    title,
    description,
    keywords: [
      name,
      `${specialty} in Lahore`,
      `${specialty} Lahore`,
      name + " Lahore",
      `${doc.qualification} doctor Lahore`,
      `best ${specialty.toLowerCase()} in Lahore`,
      `book appointment with ${name}`,
      `${specialty} consultation fee Lahore`,
    ],
    alternates: { canonical: `/doctor/${slug}` },
    openGraph: {
      title,
      description,
      url: `/doctor/${slug}`,
      type: "profile",
    },
  };
}

export default async function DoctorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let doc;
  try {
    doc = await getDoctor(slug);
  } catch (err: any) {
    const { probeDatabase } = await import("@/db");
    const probe = await probeDatabase();
    return <DbErrorNotice detail={probe.ok ? err?.message || String(err) : probe.detail} />;
  }
  if (!doc || !doc.active) notFound();

  const result = await getPublicClinicDataSafe();
  if (!result.ok) return <DbErrorNotice detail={result.detail} />;
  const data = result.data;

  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: doc.name,
    honorificPrefix: doc.title,
    description: doc.bio,
    medicalSpecialty: doc.specialty,
    url: `${siteUrl}/doctor/${slug}`,
    image: doc.avatarUrl || undefined,
    worksFor: {
      "@type": "MedicalClinic",
      name: data.settings.clinicName,
      url: siteUrl,
      address: data.settings.address,
      telephone: data.settings.phone,
    },
    availableService: {
      "@type": "MedicalProcedure",
      name: `${doc.specialty} Consultation`,
      offers: {
        "@type": "Offer",
        price: doc.fee,
        priceCurrency: "PKR",
        availability: "https://schema.org/InStock",
        url: `${siteUrl}/book?doctor=${doc.id}`,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
      <PublicDoctorProfilePage
        doctor={doc}
        settings={data.settings}
        relatedDoctors={
          data.doctors.filter((d) => d.id !== doc.id && d.specialty === doc.specialty).length > 0
            ? data.doctors.filter((d) => d.id !== doc.id && d.specialty === doc.specialty).slice(0, 3)
            : data.doctors.filter((d) => d.id !== doc.id).slice(0, 3)
        }
      />
    </>
  );
}
