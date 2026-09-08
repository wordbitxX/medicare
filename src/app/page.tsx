import ClientClinicLanding from "@/components/public/ClientClinicLanding";
import StructuredData from "@/components/seo/StructuredData";
import { getPublicClinicDataSafe } from "@/lib/clinic-data";
import DbErrorNotice from "@/components/public/DbErrorNotice";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const result = await getPublicClinicDataSafe();
  if (!result.ok) return <DbErrorNotice detail={result.detail} />;
  const data = result.data;

  return (
    <>
      <StructuredData
        settings={data.settings}
        doctors={data.doctors}
        services={data.services}
        reviews={data.reviews}
        faqs={data.faqs}
      />
      <ClientClinicLanding
        initialSettings={data.settings}
        doctors={data.doctors}
        services={data.services}
        reviews={data.reviews}
        blogPosts={data.blogPosts}
        faqs={data.faqs}
      />
    </>
  );
}
