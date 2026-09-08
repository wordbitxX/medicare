import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPatientSession } from "@/lib/patient-auth";
import PatientLoginPage from "@/components/public/PatientLoginPage";
import { getPublicClinicData } from "@/lib/clinic-data";

export const metadata: Metadata = {
  title: "Patient Login",
  description: "Sign in to your patient portal to view appointments, prescriptions and medical history.",
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await getPatientSession();
  if (session) redirect("/patient");
  const { settings } = await getPublicClinicData();
  return <PatientLoginPage settings={settings} />;
}
