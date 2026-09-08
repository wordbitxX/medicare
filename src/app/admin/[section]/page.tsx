import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

const validSections = [
  "appointments",
  "patients",
  "doctors",
  "staff",
  "services",
  "leads",
  "reviews",
  "blog",
  "faqs",
  "settings",
];

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const { section } = await params;
  if (!validSections.includes(section)) notFound();

  if (session.role === "doctor" && section !== "appointments") {
    redirect("/admin/appointments");
  }

  const receptionistSections = ["appointments", "patients", "leads", "doctors", "services"];
  if (session.role === "receptionist" && !receptionistSections.includes(section)) {
    redirect("/admin/appointments");
  }

  return <AdminDashboard currentUser={session} initialTab={section} />;
}
