import {
  ClinicSettingsType,
  DoctorType,
  FaqType,
  ServiceType,
} from "@/types";

interface Props {
  view: "services" | "doctors" | "about" | "blog" | "contact";
  settings: ClinicSettingsType;
  doctors: DoctorType[];
  services: ServiceType[];
  faqs: FaqType[];
}

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://medicareplus.pk").replace(/\/$/, "");

export default function PublicCollectionStructuredData({
  view,
  settings,
  doctors,
  services,
  faqs,
}: Props) {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: siteUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: view.charAt(0).toUpperCase() + view.slice(1),
          item: `${siteUrl}/${view}`,
        },
      ],
    },
  ];

  if (view === "services") {
    graph.push({
      "@type": "ItemList",
      name: `Medical services at ${settings.clinicName}`,
      itemListElement: services.map((service, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "MedicalProcedure",
          name: service.name,
          description: service.description,
          url: `${siteUrl}/services`,
          offers: {
            "@type": "Offer",
            price: service.price,
            priceCurrency: settings.currency,
          },
        },
      })),
    });
  }

  if (view === "doctors") {
    graph.push({
      "@type": "ItemList",
      name: `Consultant doctors at ${settings.clinicName}`,
      itemListElement: doctors.map((doctor, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Physician",
          name: doctor.name,
          description: doctor.bio,
          medicalSpecialty: doctor.specialty,
          url: `${siteUrl}/doctors`,
        },
      })),
    });
  }

  if (view === "about" || view === "contact") {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faqs.slice(0, 15).map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(
          /</g,
          "\\u003c"
        ),
      }}
    />
  );
}
