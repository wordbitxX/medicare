import {
  ClinicSettingsType,
  DoctorType,
  FaqType,
  ReviewType,
  ServiceType,
} from "@/types";
import { WORDBITX } from "@/lib/wordbitx";

interface StructuredDataProps {
  settings: ClinicSettingsType;
  doctors: DoctorType[];
  services: ServiceType[];
  reviews: ReviewType[];
  faqs?: FaqType[];
}

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://medicareplus.pk").replace(/\/$/, "");

export default function StructuredData({
  settings,
  doctors,
  services,
  reviews,
  faqs = [],
}: StructuredDataProps) {
  const graph: Record<string, any>[] = [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#developer`,
        name: WORDBITX.companyName,
        url: WORDBITX.website,
        email: WORDBITX.email,
        telephone: WORDBITX.phone,
        slogan: "Custom Software · Websites · Mobile Apps · AI · SEO & Digital Growth",
        sameAs: [WORDBITX.website, WORDBITX.whatsappHref, WORDBITX.emailHref],
        address: {
          "@type": "PostalAddress",
          addressLocality: "Lahore",
          addressRegion: "Punjab",
          addressCountry: "PK",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: settings.clinicName,
        description: settings.heroSubheadline,
        inLanguage: "en-PK",
        publisher: { "@id": `${siteUrl}/#clinic` },
        creator: { "@id": `${siteUrl}/#developer` },
      },
      {
        "@type": ["MedicalClinic", "LocalBusiness"],
        "@id": `${siteUrl}/#clinic`,
        name: settings.clinicName,
        slogan: settings.tagline || "WordbitX Specialty Care",
        url: siteUrl,
        image:
          "https://images.pexels.com/photos/7653083/pexels-photo-7653083.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
        description: settings.aboutText,
        telephone: settings.phone,
        email: settings.email,
        currenciesAccepted: settings.currency,
        priceRange: "PKR 1,500 - PKR 15,000",
        address: {
          "@type": "PostalAddress",
          streetAddress: settings.address,
          addressLocality: settings.city,
          addressRegion: "Punjab",
          postalCode: "54660",
          addressCountry: "PK",
        },
        areaServed: [
          { "@type": "Country", name: "Pakistan" },
          { "@type": "City", name: "Lahore" },
          { "@type": "City", name: "Karachi" },
          { "@type": "City", name: "Islamabad" },
        ],
        openingHours: ["Mo-Fr 08:00-22:00", "Sa 09:00-20:00", "Su 10:00-16:00"],
        medicalSpecialty: Array.from(new Set(doctors.map((doctor) => doctor.specialty))),
        availableService: services.slice(0, 15).map((service) => ({
          "@type": "MedicalProcedure",
          name: service.name,
          description: service.description,
          category: service.category,
          offers: {
            "@type": "Offer",
            priceCurrency: settings.currency,
            price: service.price,
            availability: "https://schema.org/InStock",
            url: `${siteUrl}/services`,
          },
        })),
        employee: doctors.map((doctor) => ({
          "@type": "Physician",
          name: doctor.name,
          description: doctor.bio,
          medicalSpecialty: doctor.specialty,
          honorificPrefix: doctor.title,
          knowsAbout: [doctor.specialty, doctor.qualification],
          url: `${siteUrl}/doctors`,
        })),
        aggregateRating:
          reviews.length > 0
            ? {
                "@type": "AggregateRating",
                ratingValue: (
                  reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
                ).toFixed(1),
                reviewCount: reviews.length,
                bestRating: "5",
                worstRating: "1",
              }
            : undefined,
      },
  ];

  // FAQ rich results on the homepage
  if (faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faqs.slice(0, 15).map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }

  const schema = { "@context": "https://schema.org", "@graph": graph };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
    />
  );
}
