import { redirect } from "next/navigation";
import { getPatientSession } from "@/lib/patient-auth";
import PatientPortal from "@/components/public/PatientPortal";
import { getPublicClinicData } from "@/lib/clinic-data";

export const dynamic = "force-dynamic";

export default async function PatientPage() {
  const session = await getPatientSession();
  if (!session) redirect("/patient/login");
  const { settings } = await getPublicClinicData();
  return <PatientPortal settings={settings} />;
}
