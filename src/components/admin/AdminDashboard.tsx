"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  Sparkles,
  MessageSquare,
  BookOpen,
  Settings as SettingsIcon,
  LogOut,
  ExternalLink,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  DollarSign,
  UserCheck,
  Phone,
  Mail,
  Edit2,
  Trash2,
  Printer,
  ChevronRight,
  Eye,
  AlertCircle,
  MessageCircle,
  Shield,
  FileText,
  X,
  RefreshCw,
  TrendingUp,
  ArrowUpRight,
  Check,
  Building,
  ChevronDown,
  BarChart3,
  CalendarCheck,
  Layers,
} from "lucide-react";
import { AuthSession } from "@/lib/auth";
import DoctorAvatar from "@/components/public/DoctorAvatar";
import DoctorFormModal, { type DoctorFormPayload } from "@/components/admin/DoctorFormModal";
import StaffUserFormModal, { type StaffUserPayload } from "@/components/admin/StaffUserFormModal";
import {
  ClinicSettingsType,
  DoctorType,
  ServiceType,
  PatientType,
  AppointmentType,
  LeadType,
  ReviewType,
  BlogPostType,
  FaqType,
  StaffUserType,
} from "@/types";
import { buildWhatsAppLink, defaultWhatsAppMessages } from "@/lib/whatsapp";

interface AdminDashboardProps {
  currentUser: AuthSession;
  initialTab?: string;
}

export default function AdminDashboard({ currentUser, initialTab }: AdminDashboardProps) {
  const router = useRouter();

  // Active Role Simulation (allows WordbitX demo operator to preview all 3 roles on the fly)
  const [activeRole, setActiveRole] = useState<"super_admin" | "receptionist" | "doctor">(
    currentUser.role
  );

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<string>(
    initialTab || (currentUser.role === "doctor" ? "appointments" : "overview")
  );

  // Core Data States
  const [stats, setStats] = useState<any>(null);
  const [appointmentsList, setAppointmentsList] = useState<AppointmentType[]>([]);
  const [patientsList, setPatientsList] = useState<PatientType[]>([]);
  const [doctorsList, setDoctorsList] = useState<DoctorType[]>([]);
  const [servicesList, setServicesList] = useState<ServiceType[]>([]);
  const [leadsList, setLeadsList] = useState<LeadType[]>([]);
  const [reviewsList, setReviewsList] = useState<ReviewType[]>([]);
  const [blogPostsList, setBlogPostsList] = useState<BlogPostType[]>([]);
  const [faqsList, setFaqsList] = useState<FaqType[]>([]);
  const [staffUsersList, setStaffUsersList] = useState<StaffUserType[]>([]);
  const [clinicSettingsData, setClinicSettingsData] = useState<ClinicSettingsType | null>(null);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");

  const runSeed = async () => {
    setSeeding(true);
    setSeedMsg("");
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setSeedMsg(data.error || data.detail || "Seeding failed.");
        return;
      }
      setSeedMsg(data.message || "Done.");
      await fetchAllData();
    } catch {
      setSeedMsg("Seeding failed. Check /api/health for database status.");
    } finally {
      setSeeding(false);
    }
  };

  // Modals & Action States
  const [walkinModalOpen, setWalkinModalOpen] = useState(false);
  const [selectedAppointmentForNotes, setSelectedAppointmentForNotes] = useState<AppointmentType | null>(null);
  const [newPatientModalOpen, setNewPatientModalOpen] = useState(false);
  const [newServiceModalOpen, setNewServiceModalOpen] = useState(false);
  const [newDoctorModalOpen, setNewDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<DoctorType | null>(null);
  const [doctorSearchAdmin, setDoctorSearchAdmin] = useState("");
  const [doctorSpecialtyFilter, setDoctorSpecialtyFilter] = useState("All");
  const [newBlogModalOpen, setNewBlogModalOpen] = useState(false);
  const [newFaqModalOpen, setNewFaqModalOpen] = useState(false);
  const [newStaffModalOpen, setNewStaffModalOpen] = useState(false);
  const [editingStaffUser, setEditingStaffUser] = useState<StaffUserType | null>(null);
  const [viewPatientHistory, setViewPatientHistory] = useState<PatientType | null>(null);

  // Filter States
  const [appointmentFilterStatus, setAppointmentFilterStatus] = useState<string>("all");
  const [appointmentSearch, setAppointmentSearch] = useState<string>("" );
  const [patientSearch, setPatientSearch] = useState<string>("");

  // Fetch All Clinical Data
  const fetchAllData = async () => {
    setRefreshing(true);
    try {
      const [
        statsRes,
        appRes,
        patRes,
        docRes,
        srvRes,
        leadRes,
        revRes,
        blogRes,
        faqRes,
        usersRes,
        settRes,
      ] = await Promise.all([
        fetch("/api/dashboard/stats", { cache: "no-store" }),
        fetch("/api/appointments", { cache: "no-store" }),
        fetch("/api/patients", { cache: "no-store" }),
        fetch("/api/doctors?all=true", { cache: "no-store" }),
        fetch("/api/services?all=true", { cache: "no-store" }),
        fetch("/api/leads", { cache: "no-store" }),
        fetch("/api/reviews?all=true", { cache: "no-store" }),
        fetch("/api/blog?all=true", { cache: "no-store" }),
        fetch("/api/faqs?all=true", { cache: "no-store" }),
        currentUser.role === "super_admin" ? fetch("/api/users", { cache: "no-store" }) : Promise.resolve(new Response("[]")),
        fetch("/api/settings", { cache: "no-store" }),
      ]);

      const [
        statsData,
        appData,
        patData,
        docData,
        srvData,
        leadData,
        revData,
        blogData,
        faqData,
        usersData,
        settData,
      ] = await Promise.all([
        statsRes.json(),
        appRes.json(),
        patRes.json(),
        docRes.json(),
        srvRes.json(),
        leadRes.json(),
        revRes.json(),
        blogRes.json(),
        faqRes.json(),
        usersRes.json(),
        settRes.json(),
      ]);

      if (statsData.stats) setStats(statsData.stats);
      if (Array.isArray(appData)) setAppointmentsList(appData);
      if (Array.isArray(patData)) setPatientsList(patData);
      if (Array.isArray(docData)) setDoctorsList(docData);
      if (Array.isArray(srvData)) setServicesList(srvData);
      if (Array.isArray(leadData)) setLeadsList(leadData);
      if (Array.isArray(revData)) setReviewsList(revData);
      if (Array.isArray(blogData)) setBlogPostsList(blogData);
      if (Array.isArray(faqData)) setFaqsList(faqData);
      if (Array.isArray(usersData)) setStaffUsersList(usersData);
      if (settData && !settData.error) setClinicSettingsData(settData);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // A doctor portal is intentionally live: when reception confirms payment
  // in another browser/device, the assigned patient appears automatically
  // without requiring the doctor to log out or manually reload the page.
  useEffect(() => {
    if (currentUser.role !== "doctor") return;

    const interval = window.setInterval(async () => {
      try {
        const res = await fetch("/api/appointments", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) setAppointmentsList(data);
      } catch {
        // Keep the current clinical queue if a background refresh briefly fails.
      }
    }, 5000);

    return () => window.clearInterval(interval);
  }, [currentUser.role]);

  useEffect(() => {
    const target = activeTab === "overview" ? "/admin" : `/admin/${activeTab}`;
    if (typeof window !== "undefined" && window.location.pathname !== target) {
      window.history.replaceState(null, "", target);
    }
  }, [activeTab]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  // Appointment Status Update
  const handleUpdateAppointmentStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.appointment) {
        throw new Error(data?.error || "Failed to update appointment status");
      }
      setAppointmentsList((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...data.appointment } : a))
      );
    } catch (err: any) {
      alert(err?.message || "Failed to update appointment status");
      await fetchAllData();
    }
  };

  // Update the consultation fee payment/completion status for an existing appointment.
  const handleUpdateAppointmentFeeStatus = async (id: number, paymentStatus: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ paymentStatus }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.appointment) {
        throw new Error(data?.error || "Failed to update consultation fee status");
      }
      setAppointmentsList((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...data.appointment } : a))
      );
    } catch (err: any) {
      alert(err?.message || "Failed to update consultation fee status");
      await fetchAllData();
    }
  };

  // Update the consultation fee stored on an existing appointment.
  // This changes only that appointment; changing a doctor's configured fee
  // affects future bookings and does not rewrite historical appointments.
  const handleUpdateAppointmentFee = async (id: number, currentFee: number) => {
    const input = window.prompt("Enter consultation fee (PKR):", String(currentFee ?? 0));
    if (input === null) return;

    const fee = Number(input.replace(/,/g, "").trim());
    if (!Number.isFinite(fee) || fee < 0 || !Number.isInteger(fee)) {
      alert("Please enter a valid whole-number consultation fee.");
      return;
    }

    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ fee }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.appointment) {
        throw new Error(data?.error || "Failed to update consultation fee");
      }
      setAppointmentsList((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...data.appointment } : a))
      );
    } catch (err: any) {
      alert(err?.message || "Failed to update consultation fee");
      await fetchAllData();
    }
  };

  // Save Doctor Clinical Notes
  const handleSaveDoctorNotes = async (
    id: number,
    doctorNotes: string,
    prescription: string
  ) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorNotes, prescription, status: "Completed" }),
      });
      if (res.ok) {
        setAppointmentsList((prev) =>
          prev.map((a) =>
            a.id === id
              ? { ...a, doctorNotes, prescription, status: "Completed" }
              : a
          )
        );
        setSelectedAppointmentForNotes(null);
      }
    } catch (err) {
      alert("Failed to save clinical notes");
    }
  };

  // Delete Appointment
  const handleDeleteAppointment = async (id: number) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAppointmentsList((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      alert("Failed to delete appointment");
    }
  };

  // Lead Status Update
  const handleUpdateLeadStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setLeadsList((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
        );
      }
    } catch (err) {
      alert("Failed to update lead status");
    }
  };

  // Review Toggle Published
  const handleToggleReviewPublished = async (id: number, current: boolean) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !current }),
      });
      if (res.ok) {
        setReviewsList((prev) =>
          prev.map((r) => (r.id === id ? { ...r, published: !current } : r))
        );
      }
    } catch (err) {
      alert("Failed to update review status");
    }
  };

  // Delete Review
  const handleDeleteReview = async (id: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        setReviewsList((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      alert("Failed to delete review");
    }
  };

  // Blog Toggle Published
  const handleToggleBlogPublished = async (id: number, current: boolean) => {
    try {
      const res = await fetch(`/api/blog/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !current }),
      });
      if (res.ok) {
        setBlogPostsList((prev) =>
          prev.map((b) => (b.id === id ? { ...b, published: !current } : b))
        );
      }
    } catch (err) {
      alert("Failed to update post status");
    }
  };

  // Delete Blog Post
  const handleDeleteBlogPost = async (id: number) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    try {
      const res = await fetch(`/api/blog/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBlogPostsList((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (err) {
      alert("Failed to delete blog post");
    }
  };

  // Delete Service
  const handleDeleteService = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service? It will immediately disappear from the public website.")) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (res.ok) {
        setServicesList((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      alert("Failed to delete service");
    }
  };

  // Delete Doctor
  const handleUpdateDoctor = async (id: number, updates: Partial<DoctorType>) => {
    try {
      const res = await fetch(`/api/doctors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update doctor");
      setDoctorsList((prev) =>
        prev.map((doc) => (doc.id === id ? { ...doc, ...(data.doctor || updates) } : doc))
      );
      return true;
    } catch (err: any) {
      alert(err.message || "Failed to update doctor");
      return false;
    }
  };

  const handleToggleDoctorActive = async (doc: DoctorType) => {
    await handleUpdateDoctor(doc.id, { active: !doc.active });
  };

  const handleUploadDoctorPhoto = async (file: File, doctorLabel: string) => {
    const body = new FormData();
    body.append("file", file);
    body.append("label", doctorLabel);
    const res = await fetch("/api/uploads/doctor-photo", { method: "POST", body });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Upload failed");
    }
    return data.url as string;
  };

  const handleDeleteDoctor = async (id: number) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return;
    try {
      const res = await fetch(`/api/doctors/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDoctorsList((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (err) {
      alert("Failed to delete doctor");
    }
  };

  const handleToggleFaq = async (id: number, current: boolean) => {
    try {
      const res = await fetch(`/api/faqs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !current }),
      });
      if (res.ok) {
        setFaqsList((prev) =>
          prev.map((faq) => (faq.id === id ? { ...faq, active: !current } : faq))
        );
      }
    } catch {
      alert("Failed to update FAQ visibility");
    }
  };

  const handleDeleteFaq = async (id: number) => {
    if (!confirm("Delete this FAQ permanently?")) return;
    try {
      const res = await fetch(`/api/faqs/${id}`, { method: "DELETE" });
      if (res.ok) setFaqsList((prev) => prev.filter((faq) => faq.id !== id));
    } catch {
      alert("Failed to delete FAQ");
    }
  };

  // Filtered Appointments
  let displayedAppointments = appointmentsList;
  if (activeRole === "doctor" && currentUser.doctorId) {
    displayedAppointments = displayedAppointments.filter(
      (a) => a.doctorId === currentUser.doctorId
    );
  }
  if (appointmentFilterStatus !== "all") {
    displayedAppointments = displayedAppointments.filter(
      (a) => a.status.toLowerCase() === appointmentFilterStatus.toLowerCase()
    );
  }
  if (appointmentSearch.trim()) {
    const q = appointmentSearch.toLowerCase().trim();
    displayedAppointments = displayedAppointments.filter(
      (a) =>
        a.patientName.toLowerCase().includes(q) ||
        a.patientPhone.toLowerCase().includes(q) ||
        a.appointmentNumber.toLowerCase().includes(q)
    );
  }

  // Filtered Patients
  const displayedPatients = patientsList.filter(
    (p) =>
      !patientSearch.trim() ||
      p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.phone.includes(patientSearch) ||
      p.mrn.toLowerCase().includes(patientSearch.toLowerCase()) ||
      (p.cnic || "").toLowerCase().includes(patientSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans antialiased">
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="hidden md:flex md:w-64 bg-slate-900 text-slate-300 flex-col justify-between shrink-0 border-r border-slate-800 min-h-screen sticky top-0">
        <div>
          {/* Clinic Brand & Header */}
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
                <Activity className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <h1 className="font-extrabold text-sm text-white truncate tracking-tight">
                  {clinicSettingsData?.clinicName || "Medicare Plus"}
                </h1>
                <p className="text-[10px] text-teal-400 font-semibold tracking-wider uppercase">
                  WordbitX Specialty Care
                </p>
              </div>
            </div>
          </div>

          {/* Super Admin-only Role Preview Switcher */}
          {currentUser.role === "super_admin" && (
            <div className="px-5 pt-4 pb-2">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
                  <span>Preview Role:</span>
                  <span className="font-bold text-teal-400 capitalize">
                    {activeRole.replace("_", " ")}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <button type="button" onClick={() => { setActiveRole("super_admin"); setActiveTab("overview"); }} className={`py-1 text-[10px] font-bold rounded-md ${activeRole === "super_admin" ? "bg-teal-500 text-slate-950" : "bg-slate-800 text-slate-300"}`}>
                    Admin
                  </button>
                  <button type="button" onClick={() => { setActiveRole("receptionist"); setActiveTab("appointments"); }} className={`py-1 text-[10px] font-bold rounded-md ${activeRole === "receptionist" ? "bg-teal-500 text-slate-950" : "bg-slate-800 text-slate-300"}`}>
                    Reception
                  </button>
                  <button type="button" onClick={() => { setActiveRole("doctor"); setActiveTab("appointments"); }} className={`py-1 text-[10px] font-bold rounded-md ${activeRole === "doctor" ? "bg-teal-500 text-slate-950" : "bg-slate-800 text-slate-300"}`}>
                    Doctor
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 text-xs font-semibold">
            {activeRole !== "doctor" && (
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all ${
                  activeTab === "overview"
                    ? "bg-teal-600 text-white font-bold shadow-md shadow-teal-700/25"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard Overview</span>
                </div>
              </button>
            )}

            <button
              onClick={() => setActiveTab("appointments")}
              className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all ${
                activeTab === "appointments"
                  ? "bg-teal-600 text-white font-bold shadow-md shadow-teal-700/25"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4" />
                <span>Appointments & OPD</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-teal-300">
                {appointmentsList.length}
              </span>
            </button>

            {activeRole !== "doctor" && (
              <>
                <button
                  onClick={() => setActiveTab("patients")}
                  className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all ${
                    activeTab === "patients"
                      ? "bg-teal-600 text-white font-bold shadow-md shadow-teal-700/25"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4" />
                    <span>Patients CRM (EHR)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-teal-300">
                    {patientsList.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("leads")}
                  className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all ${
                    activeTab === "leads"
                      ? "bg-teal-600 text-white font-bold shadow-md shadow-teal-700/25"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4" />
                    <span>Inquiries & Leads</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-teal-300">
                    {leadsList.length}
                  </span>
                </button>

              <button
                onClick={() => setActiveTab("doctors")}
                className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all ${
                  activeTab === "doctors"
                    ? "bg-teal-600 text-white font-bold shadow-md shadow-teal-700/25"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Stethoscope className="w-4 h-4" />
                  <span>Doctors & Schedule</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-teal-300">
                  {doctorsList.length}
                </span>
              </button>

              {activeRole === "super_admin" && (
                <button
                  onClick={() => setActiveTab("staff")}
                  className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all ${
                    activeTab === "staff"
                      ? "bg-teal-600 text-white font-bold shadow-md shadow-teal-700/25"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-4 h-4" />
                    <span>Staff Accounts</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-teal-300">
                    {staffUsersList.length}
                  </span>
                </button>
              )}

              <button
                  onClick={() => setActiveTab("services")}
                  className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all ${
                    activeTab === "services"
                      ? "bg-teal-600 text-white font-bold shadow-md shadow-teal-700/25"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4" />
                    <span>Services & Pricing</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-teal-300">
                    {servicesList.length}
                  </span>
                </button>

                {activeRole === "super_admin" && (
                  <>
                    <button
                      onClick={() => setActiveTab("reviews")}
                      className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all ${
                        activeTab === "reviews"
                          ? "bg-teal-600 text-white font-bold shadow-md shadow-teal-700/25"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-4 h-4" />
                        <span>Reviews Moderation</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-teal-300">{reviewsList.length}</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("blog")}
                      className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all ${activeTab === "blog" ? "bg-teal-600 text-white font-bold shadow-md shadow-teal-700/25" : "text-slate-400 hover:text-white hover:bg-slate-800/80"}`}
                    >
                      <div className="flex items-center gap-3"><BookOpen className="w-4 h-4" /><span>Health Guides CMS</span></div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-teal-300">{blogPostsList.length}</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("faqs")}
                      className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all ${activeTab === "faqs" ? "bg-teal-600 text-white font-bold shadow-md shadow-teal-700/25" : "text-slate-400 hover:text-white hover:bg-slate-800/80"}`}
                    >
                      <div className="flex items-center gap-3"><MessageSquare className="w-4 h-4" /><span>FAQs</span></div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-teal-300">{faqsList.length}</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("settings")}
                      className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all ${activeTab === "settings" ? "bg-teal-600 text-white font-bold shadow-md shadow-teal-700/25" : "text-slate-400 hover:text-white hover:bg-slate-800/80"}`}
                    >
                      <div className="flex items-center gap-3"><SettingsIcon className="w-4 h-4" /><span>SaaS Customizer</span></div>
                    </button>
                  </>
                )}
              </>
            )}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-700"
          >
            <span>View Live Clinic Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center justify-between pt-1 text-xs">
            <div className="overflow-hidden">
              <span className="text-white font-bold block truncate">{currentUser.name}</span>
              <span className="text-[10px] text-slate-400 block truncate">{currentUser.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/40 hover:text-red-300"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* B-Style Branded WordbitX Header */}
        <div className="hidden md:block bg-[#0A2540] border-b border-slate-800">
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500 text-[#0A2540] flex items-center justify-center font-black text-sm">
                W
              </div>
              <div>
                <div className="text-sm font-extrabold text-white leading-tight">
                  WordbitX Healthcare Management System
                </div>
                <div className="text-[10px] text-teal-300 font-semibold">
                  {new Date().toLocaleDateString("en-PK", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold text-teal-200 border border-teal-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                System Online
              </span>
              <span className="rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-extrabold text-[#0A2540] capitalize">
                {activeRole.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>

        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-3 sm:px-6 py-3 sticky top-0 z-30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="md:hidden w-8 h-8 rounded-xl bg-slate-900 text-teal-300 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="hidden md:block font-extrabold text-lg text-slate-900 tracking-tight capitalize">
              {activeTab.replace("_", " ")}
            </h2>
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="md:hidden max-w-[165px] bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900"
            >
              {activeRole !== "doctor" && <option value="overview">Dashboard</option>}
              <option value="appointments">Appointments</option>
              {activeRole !== "doctor" && <option value="patients">Patients CRM</option>}
              {activeRole !== "doctor" && <option value="leads">Leads CRM</option>}
              {activeRole !== "doctor" && <option value="doctors">Doctors</option>}
              {activeRole === "super_admin" && <option value="staff">Staff Accounts</option>}
              {activeRole !== "doctor" && <option value="services">Services</option>}
              {activeRole === "super_admin" && <option value="reviews">Reviews</option>}
              {activeRole === "super_admin" && <option value="blog">Blog CMS</option>}
              {activeRole === "super_admin" && <option value="faqs">FAQs</option>}
              {activeRole === "super_admin" && <option value="settings">Settings</option>}
            </select>
            <button
              onClick={fetchAllData}
              disabled={refreshing}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              title="Refresh clinic data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-teal-600" : ""}`} />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {activeRole !== "doctor" && (
              <button
                onClick={() => setWalkinModalOpen(true)}
                className="px-3 sm:px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Walk-in Booking</span>
                <span className="sm:hidden">Walk-in</span>
              </button>
            )}

            {activeRole === "doctor" && (
              <span className="px-2.5 sm:px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Doctor OPD</span>
              </span>
            )}
            <Link href="/" target="_blank" className="md:hidden p-2 rounded-lg bg-slate-100 text-slate-600" title="View website">
              <ExternalLink className="w-4 h-4" />
            </Link>
            <button onClick={handleLogout} className="md:hidden p-2 rounded-lg bg-red-50 text-red-600" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Inner Content Padding */}
        <div className="p-3 sm:p-6 space-y-6 flex-1">
          {/* Empty database banner — one-click demo seeding */}
          {stats && stats.totalDoctors === 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-amber-900">Database is connected but empty</h3>
                  <p className="mt-1 text-xs leading-relaxed text-amber-800">
                    Tables exist but contain no data. Seed the demo dataset (84 doctors, 23 services,
                    12 articles, staff logins, appointments) with one click — or set
                    <code className="mx-1 rounded bg-amber-100 px-1 font-mono">SEED_DEMO_DATA=true</code>
                    and restart to seed automatically.
                  </p>
                  {seedMsg && <p className="mt-2 text-xs font-bold text-amber-900">{seedMsg}</p>}
                </div>
                <button
                  onClick={runSeed}
                  disabled={seeding}
                  className="shrink-0 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-extrabold text-amber-950 transition hover:bg-amber-400 disabled:opacity-60"
                >
                  {seeding ? "Seeding..." : "Seed Demo Data"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && stats && (
            <div className="space-y-6">
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                    <span>Registered Patients</span>
                    <Users className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-3xl font-black text-slate-900">
                    {stats.totalPatients}
                  </div>
                  <div className="text-[11px] text-teal-700 font-semibold mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>In Clinical EHR Directory</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                    <span>Total Appointments</span>
                    <Calendar className="w-4 h-4 text-sky-600" />
                  </div>
                  <div className="text-3xl font-black text-slate-900">
                    {stats.totalAppointments}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    <strong className="text-emerald-700 font-bold">{stats.confirmedAppointmentsCount} Confirmed</strong> • {stats.pendingAppointmentsCount} Pending
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                    <span>Revenue Collected</span>
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-black text-emerald-700">
                    PKR {stats.totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    From Completed Consultations
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                    <span>Inquiries & Leads</span>
                    <Phone className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-3xl font-black text-slate-900">
                    {stats.totalLeads}
                  </div>
                  <div className="text-[11px] text-amber-700 font-bold mt-1">
                    {stats.newLeadsCount} New Inquiries to Follow-up
                  </div>
                </div>
              </div>

              {/* Charts Row — B Style (Analytics) */}
              <div className="grid gap-4 lg:grid-cols-5">
                {/* Patient Growth (14-day registrations — simple line) */}
                <div className="lg:col-span-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">Patient Growth (Last 14 Days)</h3>
                      <p className="text-[11px] text-slate-500">New patient registrations per day from CRM</p>
                    </div>
                    <TrendingUp className="h-4 w-4 text-teal-600" />
                  </div>
                  {(() => {
                    const raw: Array<{ day: string; count: number }> =
                      (stats as any).patientSeries || (stats as any).patientSeries === undefined
                        ? (stats as any).patientSeries || []
                        : [];
                    const series = (stats as any).patientSeries || raw || [];
                    // build last-14 calendar days
                    const days: Array<{ day: string; count: number }> = [];
                    const map = new Map(
                      (Array.isArray(series) ? series : []).map((r: any) => [
                        typeof r.day === "string" ? r.day.slice(0, 10) : String(r.day),
                        Number(r.count) || 0,
                      ])
                    );
                    const today = new Date();
                    for (let i = 13; i >= 0; i--) {
                      const d = new Date(today);
                      d.setDate(today.getDate() - i);
                      const iso = d.toISOString().slice(0, 10);
                      days.push({ day: iso, count: map.get(iso) ?? 0 });
                    }
                    const max = Math.max(...days.map((d) => d.count), 1);
                    return (
                      <div className="flex h-36 items-end gap-1.5">
                        {days.map((d) => (
                          <div key={d.day} className="group flex flex-1 flex-col items-center justify-end">
                            <div className="mb-1 hidden text-[10px] font-bold text-[#0A2540] group-hover:block">
                              {d.count}
                            </div>
                            <div
                              className="w-full rounded-t-md bg-gradient-to-t from-teal-600 to-emerald-400 transition-all group-hover:from-[#0A2540] group-hover:to-teal-600"
                              style={{ height: `${Math.max((d.count / max) * 100, d.count > 0 ? 8 : 2)}%` }}
                              title={`${d.day.slice(5)}: ${d.count} patients`}
                            />
                            <div className="mt-1.5 text-[8px] font-bold text-slate-400">
                              {d.day.slice(8)}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Appointment Types donut */}
                <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">Appointment Types</h3>
                      <p className="text-[11px] text-slate-500">Shift-wise distribution</p>
                    </div>
                    <Layers className="h-4 w-4 text-teal-600" />
                  </div>
                  {(() => {
                    const dist: Array<{ name: string; count: number }> =
                      (stats as any).appointmentTypeDistribution || [];
                    const palette = ["#0d9488", "#0ea5e9", "#6366f1", "#f59e0b", "#94a3b8", "#e11d48"];
                    const total = dist.reduce((s, d) => s + (d.count || 0), 0) || 1;
                    return (
                      <div className="space-y-4">
                        {dist.slice(0, 5).map((d, i) => {
                          const pct = Math.round((d.count / total) * 100);
                          return (
                            <div key={d.name}>
                              <div className="mb-1 flex justify-between text-[11px]">
                                <span className="font-bold text-slate-700">{d.name}</span>
                                <span className="font-black text-slate-900">{d.count} <span className="font-semibold text-slate-400">({pct}%)</span></span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: palette[i % palette.length] }}
                                />
                              </div>
                            </div>
                          );
                        })}
                        {dist.length === 0 && (
                          <p className="py-6 text-center text-xs text-slate-400">No bookings yet</p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Activity Feed + Operations (B Style) */}
              <div className="grid gap-4 lg:grid-cols-5">
                {/* Clinical Feed */}
                <div className="lg:col-span-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-extrabold text-base text-slate-900">Clinical Feed</h3>
                    <button
                      onClick={() => setActiveTab("appointments")}
                      className="text-xs font-bold text-teal-700 hover:underline"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-0.5">
                    {appointmentsList.slice(0, 6).map((a) => {
                      const badge =
                        a.status === "Completed"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : a.status === "Cancelled"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-amber-50 text-amber-700 border-amber-200";
                      return (
                        <div
                          key={a.id}
                          className="flex items-start gap-3 border-b border-slate-50 py-3 last:border-0"
                        >
                          <span className={`mt-0.5 shrink-0 rounded-md border px-2 py-0.5 text-[9px] font-extrabold ${badge}`}>
                            {a.status}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-extrabold text-slate-900 truncate">
                                {a.patientName}
                              </p>
                              <span className="font-mono text-[10px] text-teal-800 font-bold shrink-0">
                                {a.appointmentNumber}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500">
                              {a.doctorName || "Assigned Consultant"} • {a.appointmentDate} at {a.appointmentTime}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {newFaqModalOpen === false && patientsList.slice(0, 2).map((p) => (
                      <div key={`p-${p.id}`} className="flex items-start gap-3 border-b border-slate-50 py-3 last:border-0">
                        <span className="mt-0.5 shrink-0 rounded-md border bg-sky-50 text-sky-700 border-sky-200 px-2 py-0.5 text-[9px] font-extrabold">
                          New Patient
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-extrabold text-slate-900 truncate">{p.name}</p>
                            <span className="font-mono text-[10px] text-slate-500 font-bold shrink-0">{p.mrn}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {p.phone}{p.cnic ? ` • CNIC ${p.cnic}` : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Operations Actions (A grid style with B descriptions) */}
                <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                  <h3 className="mb-4 font-extrabold text-base text-slate-900">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { label: "Book Setup", icon: Calendar, tab: "appointments", desc: "New OPD slot" },
                      { label: "Patients", icon: Users, tab: "patients", desc: "EHR registry" },
                      { label: "Leads", icon: MessageSquare, tab: "leads", desc: "Inbox" },
                      { label: "Doctors", icon: Stethoscope, tab: "doctors", desc: "Team & shifts" },
                      { label: "Services", icon: Sparkles, tab: "services", desc: "Price list" },
                      { label: "Post CMS", icon: BookOpen, tab: "blog", desc: "Guides editor" },
                      { label: "FAQ CMS", icon: Layers, tab: "faqs", desc: "Knowledge base" },
                      { label: "Settings", icon: SettingsIcon, tab: "settings", desc: "Panel config" },
                    ].map((a) => (
                      <button
                        key={a.label}
                        onClick={() => setActiveTab(a.tab)}
                        className="group flex flex-col items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-left transition hover:border-teal-300 hover:bg-teal-50"
                      >
                        <div className="flex w-full items-center justify-between">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0A2540] text-teal-300">
                            <a.icon className="h-4 w-4" />
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-teal-600" />
                        </div>
                        <div>
                          <div className="text-xs font-extrabold text-slate-900">{a.label}</div>
                          <div className="text-[10px] font-semibold text-slate-500">{a.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Today's Clinic Queue */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-600" />
                      <span>Today's OPD Queue & Patient Check-in</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Live queue management for arriving walk-in and scheduled appointments
                    </p>
                  </div>

                  <button
                    onClick={() => setWalkinModalOpen(true)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Quick Walk-in</span>
                  </button>
                </div>

                {/* Queue Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-100 pb-2">
                        <th className="pb-3 font-bold">Booking Ref</th>
                        <th className="pb-3 font-bold">Patient Details</th>
                        <th className="pb-3 font-bold">Attending Doctor</th>
                        <th className="pb-3 font-bold">Slot Time</th>
                        <th className="pb-3 font-bold">Current Status</th>
                        <th className="pb-3 font-bold text-right">Quick OPD Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {appointmentsList.slice(0, 8).map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 font-mono font-extrabold text-teal-800">
                            {app.appointmentNumber}
                          </td>
                          <td className="py-3.5">
                            <div className="font-extrabold text-slate-900">{app.patientName}</div>
                            <div className="text-[11px] text-slate-500">{app.patientPhone}</div>
                          </td>
                          <td className="py-3.5">
                            <div className="font-bold text-slate-800">{app.doctorName || "Assigned Consultant"}</div>
                            <div className="text-[11px] text-slate-500">{app.doctorRoom}</div>
                          </td>
                          <td className="py-3.5 font-bold text-slate-700">
                            {app.appointmentDate} • {app.appointmentTime}
                          </td>
                          <td className="py-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                                app.status === "Completed"
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : "bg-amber-50 text-amber-800 border border-amber-200"
                              }`}
                            >
                              {app.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {app.status !== "In Consultation" && app.status !== "Completed" && (
                                <button
                                  onClick={() => handleUpdateAppointmentStatus(app.id, "In Consultation")}
                                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold transition-colors border border-blue-200"
                                >
                                  In Room
                                </button>
                              )}
                              {app.status !== "Completed" && (
                                <button
                                  onClick={() => handleUpdateAppointmentStatus(app.id, "Completed")}
                                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-bold transition-colors border border-emerald-200"
                                >
                                  Done
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedAppointmentForNotes(app)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold"
                              >
                                {currentUser.role === "doctor" ? "Rx" : "View Rx"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APPOINTMENTS CRM */}
          {activeTab === "appointments" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Appointments Directory & Schedule
                  </h3>
                  <p className="text-xs text-slate-500">
                    {displayedAppointments.length} matching appointments
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search patient, phone, ref..."
                      value={appointmentSearch}
                      onChange={(e) => setAppointmentSearch(e.target.value)}
                      className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-teal-500"
                    />
                  </div>

                  <select
                    value={appointmentFilterStatus}
                    onChange={(e) => setAppointmentFilterStatus(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="In Consultation">In Consultation</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="No-Show">No-Show</option>
                  </select>

                  <button
                    onClick={() => setWalkinModalOpen(true)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Book Appointment</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100 pb-2">
                      <th className="pb-3 font-bold">Booking Ref</th>
                      <th className="pb-3 font-bold">Patient</th>
                      <th className="pb-3 font-bold">Doctor & Specialty</th>
                      <th className="pb-3 font-bold">Schedule</th>
                      <th className="pb-3 font-bold">Status</th>
                      <th className="pb-3 font-bold">Consultation Fee (PKR)</th>
                      <th className="pb-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedAppointments.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 font-mono font-extrabold text-teal-800">
                          {app.appointmentNumber}
                        </td>
                        <td className="py-3.5">
                          <div className="font-extrabold text-slate-900">{app.patientName}</div>
                          <div className="text-[11px] text-slate-500">{app.patientPhone}</div>
                        </td>
                        <td className="py-3.5">
                          <div className="font-bold text-slate-800">{app.doctorName || "Doctor"}</div>
                          <div className="text-[11px] text-slate-500">{app.serviceName || app.visitType}</div>
                        </td>
                        <td className="py-3.5 font-bold text-slate-700">
                          {app.appointmentDate} • {app.appointmentTime}
                        </td>
                        <td className="py-3.5">
                          <select
                            value={app.status}
                            onChange={(e) => handleUpdateAppointmentStatus(app.id, e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-800"
                          >
                            {currentUser.role === "doctor" ? (
                              <>
                                <option value="Confirmed">Confirmed</option>
                                <option value="In Consultation">In Consultation</option>
                                <option value="Completed">Completed</option>
                                <option value="No-Show">No-Show</option>
                              </>
                            ) : (
                              <>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Pending">Pending</option>
                                <option value="In Consultation">In Consultation</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="No-Show">No-Show</option>
                              </>
                            )}
                          </select>
                        </td>
                        <td className="py-3.5 font-black text-teal-800">
                          <div className="flex min-w-[150px] flex-col items-start gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateAppointmentFee(app.id, app.fee)}
                              disabled={currentUser.role === "doctor"}
                              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-left transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60"
                              title={currentUser.role === "doctor" ? "Reception/Admin can update the consultation fee" : "Edit consultation fee"}
                            >
                              PKR {app.fee?.toLocaleString()}
                              {currentUser.role !== "doctor" && <Edit2 className="h-3 w-3 text-slate-400" />}
                            </button>
                            <select
                              value={app.paymentStatus === "Paid" ? "Completed" : app.paymentStatus || "Pending"}
                              onChange={(e) =>
                                handleUpdateAppointmentFeeStatus(
                                  app.id,
                                  e.target.value === "Completed" ? "Paid" : e.target.value
                                )
                              }
                              disabled={currentUser.role === "doctor"}
                              className={`rounded-lg border px-2 py-1 text-[10px] font-bold ${
                                app.paymentStatus === "Paid"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-amber-200 bg-amber-50 text-amber-700"
                              } disabled:cursor-not-allowed disabled:opacity-60`}
                              title="Consultation Fee Status"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>
                        </td>
                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedAppointmentForNotes(app)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                            title={currentUser.role === "doctor" ? "Doctor Notes & Prescription" : "View Doctor Notes & Prescription"}
                          >
                              <FileText className="w-4 h-4 text-teal-700" />
                            </button>
                            <button
                              onClick={() => window.print()}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                              title="Print Slip"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAppointment(app.id)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                              title="Delete Appointment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PATIENTS CRM */}
          {activeTab === "patients" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Patient Directory & EHR Records
                  </h3>
                  <p className="text-xs text-slate-500">
                    {displayedPatients.length} registered patients
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search MRN, Name, Phone..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-teal-500"
                    />
                  </div>

                  <button
                    onClick={() => setNewPatientModalOpen(true)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Register Patient</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100 pb-2">
                      <th className="pb-3 font-bold">MRN</th>
                      <th className="pb-3 font-bold">Patient Name</th>
                      <th className="pb-3 font-bold">Contact</th>
                      <th className="pb-3 font-bold">CNIC</th>
                      <th className="pb-3 font-bold">Demographics</th>
                      <th className="pb-3 font-bold">Blood Group</th>
                      <th className="pb-3 font-bold">Visits</th>
                      <th className="pb-3 font-bold text-right">Medical History</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedPatients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 font-mono font-extrabold text-sky-800">
                          {patient.mrn}
                        </td>
                        <td className="py-3.5 font-extrabold text-slate-900">
                          {patient.name}
                          {patient.allergies && (
                            <span className="block text-[10px] text-red-600 font-semibold">
                              Allergy: {patient.allergies}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 text-slate-700">
                          <div className="font-bold">{patient.phone}</div>
                          <div className="text-[10px] text-slate-500">{patient.email || "No email"}</div>
                        </td>
                        <td className="py-3.5 text-slate-600 font-medium">
                          {patient.cnic || "—"}
                        </td>
                        <td className="py-3.5 text-slate-600">
                          {patient.gender} • {patient.age} yrs
                        </td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-extrabold">
                            {patient.bloodGroup || "N/A"}
                          </span>
                        </td>
                        <td className="py-3.5 font-extrabold text-teal-800">
                          {patient.totalVisits} visit(s)
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => setViewPatientHistory(patient)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold transition-colors"
                          >
                            View Record
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: LEADS CRM */}
          {activeTab === "leads" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Inquiries & Leads CRM</h3>
                  <p className="text-xs text-slate-500">
                    {leadsList.length} inquiries received from website forms & WhatsApp clicks
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100 pb-2">
                      <th className="pb-3 font-bold">Lead Name</th>
                      <th className="pb-3 font-bold">Contact</th>
                      <th className="pb-3 font-bold">Service Required</th>
                      <th className="pb-3 font-bold">Channel</th>
                      <th className="pb-3 font-bold">Message / Notes</th>
                      <th className="pb-3 font-bold">Status</th>
                      <th className="pb-3 font-bold text-right">WhatsApp Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leadsList.map((lead) => {
                      const waFollowup = buildWhatsAppLink(
                        lead.phone,
                        `Hello ${lead.name}! This is ${clinicSettingsData?.clinicName || "Medicare Plus"}. We received your inquiry regarding ${lead.serviceInterested || "our clinical services"}. How may we assist you today?`
                      );

                      return (
                        <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 font-extrabold text-slate-900">{lead.name}</td>
                          <td className="py-3.5 text-slate-700">
                            <div className="font-bold">{lead.phone}</div>
                            <div className="text-[10px] text-slate-500">{lead.email}</div>
                          </td>
                          <td className="py-3.5 text-teal-800 font-extrabold">
                            {lead.serviceInterested || "General Inquiry"}
                          </td>
                          <td className="py-3.5 text-slate-500">{lead.source}</td>
                          <td className="py-3.5 text-slate-700 max-w-xs truncate">
                            {lead.notes || "—"}
                          </td>
                          <td className="py-3.5">
                            <select
                              value={lead.status}
                              onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-800"
                            >
                              <option value="New">New</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Converted">Converted</option>
                              <option value="Dropped">Dropped</option>
                            </select>
                          </td>
                          <td className="py-3.5 text-right">
                            <a
                              href={waFollowup}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-xs transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5 fill-white" />
                              <span>WhatsApp</span>
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: DOCTORS MANAGEMENT */}
          {activeTab === "doctors" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Consultant Doctors & Shift Schedules
                  </h3>
                  <p className="text-xs text-slate-500">
                    Total {doctorsList.length} • Active {doctorsList.filter((d) => d.active).length} • Featured {doctorsList.filter((d) => d.featured).length}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search doctor..."
                      value={doctorSearchAdmin}
                      onChange={(e) => setDoctorSearchAdmin(e.target.value)}
                      className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-teal-500"
                    />
                  </div>
                  <select
                    value={doctorSpecialtyFilter}
                    onChange={(e) => setDoctorSpecialtyFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  >
                    <option value="All">All Specialties</option>
                    {Array.from(new Set(doctorsList.map((d) => d.specialty)))
                      .sort()
                      .map((sp) => (
                        <option key={sp} value={sp}>
                          {sp}
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={() => setNewDoctorModalOpen(true)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Doctor</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctorsList
                  .filter((doc) => {
                    const q = doctorSearchAdmin.trim().toLowerCase();
                    const matchesQuery =
                      !q ||
                      doc.name.toLowerCase().includes(q) ||
                      doc.specialty.toLowerCase().includes(q) ||
                      (doc.qualification || "").toLowerCase().includes(q);
                    const matchesSpecialty =
                      doctorSpecialtyFilter === "All" || doc.specialty === doctorSpecialtyFilter;
                    return matchesQuery && matchesSpecialty;
                  })
                  .map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start gap-3 mb-3">
                          <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-slate-100 shadow-inner">
                            {doc.avatarUrl ? (
                              <img
                                src={doc.avatarUrl}
                                alt={doc.name}
                                className="w-full h-full object-cover object-top"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-900 text-teal-300 text-sm font-bold">
                                {doc.name
                                  .replace(/^Dr\.?\s*/i, "")
                                  .split(" ")
                                  .filter((w) => w.length > 1)
                                  .map((w) => w[0])
                                  .join("")
                                  .slice(0, 2)}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-extrabold text-slate-900 text-sm truncate">
                              {doc.name}
                            </h4>
                            <span className="text-teal-700 text-[11px] font-bold block">
                              {doc.specialty}
                            </span>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">
                              {doc.qualification}
                            </p>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl">
                          <div className="flex justify-between">
                            <span>Room</span>
                            <strong className="text-slate-900">{doc.roomNo}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Shift</span>
                            <strong className="text-slate-900">
                              {doc.shiftStart} – {doc.shiftEnd}
                            </strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Days</span>
                            <strong className="text-slate-900">{doc.availableDays}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Fee</span>
                            <strong className="text-teal-800 font-extrabold">
                              PKR {doc.fee.toLocaleString()}
                            </strong>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleToggleDoctorActive(doc)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition ${
                            doc.active
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                          title="Toggle active status"
                        >
                          {doc.active ? "Active" : "Inactive"}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingDoctor(doc)}
                            className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-[10px] font-bold rounded-lg border border-teal-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDoctor(doc.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Doctor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 6: STAFF ACCOUNTS */}
          {activeTab === "staff" && activeRole === "super_admin" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Doctor & Receptionist Login Credentials</h3>
                  <p className="text-xs text-slate-500">
                    Create separate doctor panels and receptionist accounts. Doctors can only log in after a staff account is created here.
                  </p>
                </div>
                <button
                  onClick={() => setNewStaffModalOpen(true)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Credentials</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100 pb-2">
                      <th className="pb-3 font-bold">Staff Name</th>
                      <th className="pb-3 font-bold">Email</th>
                      <th className="pb-3 font-bold">Role</th>
                      <th className="pb-3 font-bold">Linked Doctor</th>
                      <th className="pb-3 font-bold">Phone</th>
                      <th className="pb-3 font-bold">Status</th>
                      <th className="pb-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {staffUsersList.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 font-bold text-slate-900">{user.name}</td>
                        <td className="py-3.5 text-slate-700">{user.email}</td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                            {user.role.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3.5 text-slate-600">{user.doctorName || "—"}</td>
                        <td className="py-3.5 text-slate-600">{user.phone || "—"}</td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${user.active ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-slate-100 text-slate-500"}`}>
                            {user.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingStaffUser(user)}
                              className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-[10px] font-bold rounded-lg border border-teal-100"
                            >
                              Edit
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm(`Delete staff account for ${user.name}?`)) return;
                                const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
                                if (res.ok) setStaffUsersList((prev) => prev.filter((u) => u.id !== user.id));
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Staff Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: SERVICES MANAGEMENT */}
          {activeTab === "services" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Clinical Services & Procedures Price List
                  </h3>
                  <p className="text-xs text-slate-500">
                    {servicesList.length} services configured
                  </p>
                </div>

                <button
                  onClick={() => setNewServiceModalOpen(true)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Service</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100 pb-2">
                      <th className="pb-3 font-bold">Service Name</th>
                      <th className="pb-3 font-bold">Category</th>
                      <th className="pb-3 font-bold">Duration</th>
                      <th className="pb-3 font-bold">Service Price (PKR)</th>
                      <th className="pb-3 font-bold">Status</th>
                      <th className="pb-3 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {servicesList.map((srv) => (
                      <tr key={srv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 font-extrabold text-slate-900">
                          {srv.name}
                          {srv.badge && (
                            <span className="ml-2 px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 text-[9px] font-bold">
                              {srv.badge}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 text-slate-700 font-medium">{srv.category}</td>
                        <td className="py-3.5 text-slate-500">{srv.durationMinutes} mins</td>
                        <td className="py-3.5 font-black text-teal-800">
                          PKR {srv.price.toLocaleString()}
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              srv.active ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {srv.active ? "Active" : "Hidden"}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => handleDeleteService(srv.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Service"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: REVIEWS MODERATION */}
          {activeTab === "reviews" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Patient Reviews Moderation
                  </h3>
                  <p className="text-xs text-slate-500">
                    Unpublished reviews will immediately disappear from the public website.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {reviewsList.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">{rev.patientName}</span>
                        <span className="text-amber-500 font-black">★ {rev.rating}/5</span>
                        <span className="text-slate-500 font-medium">• {rev.treatment}</span>
                      </div>
                      <p className="text-slate-600 italic">"{rev.comment}"</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggleReviewPublished(rev.id, rev.published)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                          rev.published
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {rev.published ? "Published (Live)" : "Hidden (Draft)"}
                      </button>

                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: BLOG CMS */}
          {activeTab === "blog" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Health Guides CMS</h3>
                  <p className="text-xs text-slate-500">
                    {blogPostsList.length} articles authored by clinic doctors
                  </p>
                </div>

                <button
                  onClick={() => setNewBlogModalOpen(true)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Write Article</span>
                </button>
              </div>

              <div className="space-y-3">
                {blogPostsList.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-extrabold text-teal-800 text-xs">{post.category}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600 font-medium">By {post.authorName}</span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{post.title}</h4>
                      <p className="text-slate-500 line-clamp-1 mt-0.5">{post.summary}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggleBlogPublished(post.id, post.published)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                          post.published
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {post.published ? "Published" : "Draft"}
                      </button>

                      <button
                        onClick={() => handleDeleteBlogPost(post.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete Article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: FAQ CMS */}
          {activeTab === "faqs" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Frequently Asked Questions CMS</h3>
                  <p className="text-xs text-slate-500">
                    {faqsList.length} questions configured. Hidden questions disappear from public pages immediately.
                  </p>
                </div>
                <button
                  onClick={() => setNewFaqModalOpen(true)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add FAQ</span>
                </button>
              </div>

              <div className="space-y-3">
                {faqsList.map((faq) => (
                  <div
                    key={faq.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold">
                          {faq.category}
                        </span>
                        <span className="text-slate-400">Order {faq.orderNumber}</span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{faq.question}</h4>
                      <p className="text-slate-500 line-clamp-2 mt-1 leading-relaxed">{faq.answer}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggleFaq(faq.id, faq.active)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                          faq.active
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {faq.active ? "Visible" : "Hidden"}
                      </button>
                      <button
                        onClick={() => handleDeleteFaq(faq.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete FAQ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: CLINIC CUSTOMIZER & SAAS BRANDING */}
          {activeTab === "settings" && clinicSettingsData && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h3 className="font-extrabold text-xl text-slate-900">
                  Clinic Customizer & SaaS Branding
                </h3>
                <p className="text-xs text-slate-500">
                  WordbitX SaaS Sales Demo: Switch clinic specialty presets or customize branding, contact numbers, and copy.
                </p>
              </div>

              {/* 1-Click Clinic Preset Switcher */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-extrabold text-teal-800 uppercase tracking-wider block">
                  1-Click Specialty Mode Switcher:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "multispecialty", label: "🏥 Multi-Specialty Hospital" },
                    { key: "dental", label: "🦷 Dental Studio" },
                    { key: "skin", label: "✨ Skin & Derma Clinic" },
                    { key: "eye", label: "👁️ Vision & Eye Center" },
                    { key: "physio", label: "🏃 Physiotherapy & Rehab" },
                    { key: "pediatric", label: "👶 Pediatric & Child Care" },
                  ].map((preset) => (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={async () => {
                        const res = await fetch("/api/settings", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ preset: preset.key }),
                        });
                        const data = await res.json();
                        if (data.settings) {
                          setClinicSettingsData(data.settings);
                          alert(`Switched clinic branding to ${preset.label}!`);
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-xs font-bold text-slate-800 border border-slate-300 transition-colors shadow-xs"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form to edit settings */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const res = await fetch("/api/settings", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(clinicSettingsData),
                  });
                  if (res.ok) {
                    alert("Clinic settings updated successfully!");
                  }
                }}
                className="space-y-4 text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">
                      Clinic Brand Name
                    </label>
                    <input
                      type="text"
                      value={clinicSettingsData.clinicName}
                      onChange={(e) =>
                        setClinicSettingsData({
                          ...clinicSettingsData,
                          clinicName: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">
                      Clinic Tagline
                    </label>
                    <input
                      type="text"
                      value={clinicSettingsData.tagline}
                      onChange={(e) =>
                        setClinicSettingsData({
                          ...clinicSettingsData,
                          tagline: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">
                      Phone Helpline
                    </label>
                    <input
                      type="text"
                      value={clinicSettingsData.phone}
                      onChange={(e) =>
                        setClinicSettingsData({
                          ...clinicSettingsData,
                          phone: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">
                      WhatsApp Number (CTAs)
                    </label>
                    <input
                      type="text"
                      value={clinicSettingsData.whatsapp}
                      onChange={(e) =>
                        setClinicSettingsData({
                          ...clinicSettingsData,
                          whatsapp: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">
                      Emergency Hotline
                    </label>
                    <input
                      type="text"
                      value={clinicSettingsData.emergencyPhone}
                      onChange={(e) =>
                        setClinicSettingsData({
                          ...clinicSettingsData,
                          emergencyPhone: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">
                      Clinic Address
                    </label>
                    <input
                      type="text"
                      value={clinicSettingsData.address}
                      onChange={(e) =>
                        setClinicSettingsData({
                          ...clinicSettingsData,
                          address: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={clinicSettingsData.city}
                      onChange={(e) =>
                        setClinicSettingsData({
                          ...clinicSettingsData,
                          city: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Public Email Address</label>
                    <input
                      type="email"
                      value={clinicSettingsData.email}
                      onChange={(e) => setClinicSettingsData({ ...clinicSettingsData, email: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Primary Color</label>
                      <input
                        type="color"
                        value={clinicSettingsData.primaryColor}
                        onChange={(e) => setClinicSettingsData({ ...clinicSettingsData, primaryColor: e.target.value })}
                        className="w-full h-10 p-1 bg-slate-50 border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Secondary Color</label>
                      <input
                        type="color"
                        value={clinicSettingsData.secondaryColor}
                        onChange={(e) => setClinicSettingsData({ ...clinicSettingsData, secondaryColor: e.target.value })}
                        className="w-full h-10 p-1 bg-slate-50 border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Homepage Hero Heading</label>
                  <input
                    type="text"
                    value={clinicSettingsData.heroHeadline}
                    onChange={(e) => setClinicSettingsData({ ...clinicSettingsData, heroHeadline: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Homepage Hero Description</label>
                  <textarea
                    rows={2}
                    value={clinicSettingsData.heroSubheadline}
                    onChange={(e) => setClinicSettingsData({ ...clinicSettingsData, heroSubheadline: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">About Clinic Content</label>
                  <textarea
                    rows={3}
                    value={clinicSettingsData.aboutText}
                    onChange={(e) => setClinicSettingsData({ ...clinicSettingsData, aboutText: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Weekday Hours</label>
                    <input
                      value={clinicSettingsData.openingHoursWeekday}
                      onChange={(e) => setClinicSettingsData({ ...clinicSettingsData, openingHoursWeekday: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Saturday Hours</label>
                    <input
                      value={clinicSettingsData.openingHoursSaturday}
                      onChange={(e) => setClinicSettingsData({ ...clinicSettingsData, openingHoursSaturday: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Sunday / Emergency</label>
                    <input
                      value={clinicSettingsData.openingHoursSunday}
                      onChange={(e) => setClinicSettingsData({ ...clinicSettingsData, openingHoursSunday: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-md transition-all"
                >
                  Save Settings & Update Website
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* MODAL: Clinical Notes & Rx Summary */}
      {selectedAppointmentForNotes && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl text-xs space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Doctor Consultation Notes</h4>
                <p className="text-slate-500">
                  {selectedAppointmentForNotes.patientName} ({selectedAppointmentForNotes.appointmentNumber})
                </p>
              </div>
              <button
                onClick={() => setSelectedAppointmentForNotes(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!(currentUser.role === "doctor" && currentUser.doctorId === selectedAppointmentForNotes.doctorId) && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] font-semibold text-amber-800">
                This prescription is read-only here. Only the assigned doctor can write or edit clinical notes and medicines.
              </div>
            )}

            <div>
              <label className="text-slate-700 font-bold block mb-1">
                Clinical Diagnosis & OPD Notes
              </label>
              <textarea
                rows={3}
                defaultValue={selectedAppointmentForNotes.doctorNotes || ""}
                id="modalDoctorNotes"
                readOnly={!(currentUser.role === "doctor" && currentUser.doctorId === selectedAppointmentForNotes.doctorId)}
                placeholder="Diagnosis, blood pressure, laboratory tests requested..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
              />
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">
                Prescription (Medicines, Dosage, Timing)
              </label>
              <textarea
                rows={3}
                defaultValue={selectedAppointmentForNotes.prescription || ""}
                id="modalDoctorRx"
                readOnly={!(currentUser.role === "doctor" && currentUser.doctorId === selectedAppointmentForNotes.doctorId)}
                placeholder="1. Tab Panadol 500mg TDS\n2. Syp Amoxil 250mg..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedAppointmentForNotes(null)}
                className="px-4 py-2 text-slate-600"
              >
                Close
              </button>
              {currentUser.role === "doctor" && currentUser.doctorId === selectedAppointmentForNotes.doctorId && (
                <button
                  onClick={() => {
                    const notes = (document.getElementById("modalDoctorNotes") as HTMLTextAreaElement).value;
                    const rx = (document.getElementById("modalDoctorRx") as HTMLTextAreaElement).value;
                    handleSaveDoctorNotes(selectedAppointmentForNotes.id, notes, rx);
                  }}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save & Complete Consultation
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Walk-in Booking */}
      {walkinModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl text-xs space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h4 className="font-extrabold text-slate-900 text-base">New Walk-In OPD Patient</h4>
              <button onClick={() => setWalkinModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const body = {
                  patientName: (form.elements.namedItem("pName") as HTMLInputElement).value,
                  patientPhone: (form.elements.namedItem("pPhone") as HTMLInputElement).value,
                  doctorId: Number((form.elements.namedItem("pDoctor") as HTMLSelectElement).value),
                  appointmentDate: (form.elements.namedItem("pDate") as HTMLInputElement).value,
                  appointmentTime: (form.elements.namedItem("pTime") as HTMLSelectElement).value,
                  visitType: "New Consultation",
                };

                const res = await fetch("/api/appointments", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(body),
                });
                const data = await res.json();
                if (res.ok) {
                  setAppointmentsList([data.appointment, ...appointmentsList]);
                  setWalkinModalOpen(false);
                  alert(`Walk-in booked! Code: ${data.appointmentCode}`);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-slate-700 font-bold block mb-1">Patient Name *</label>
                <input
                  name="pName"
                  required
                  placeholder="e.g. Tariq Mahmood"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Phone Number *</label>
                <input
                  name="pPhone"
                  required
                  placeholder="+92 300 1234567"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Doctor</label>
                <select
                  name="pDoctor"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                >
                  {doctorsList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialty}) • Fee: PKR {d.fee}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Date</label>
                  <input
                    name="pDate"
                    type="date"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Time Slot</label>
                  <select
                    name="pTime"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                  >
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setWalkinModalOpen(false)}
                  className="px-4 py-2 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Confirm Walk-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: View Patient History */}
      {viewPatientHistory && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl text-xs space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">{viewPatientHistory.name}</h4>
                <p className="text-slate-500 font-mono">MRN: {viewPatientHistory.mrn}</p>
              </div>
              <button
                onClick={() => setViewPatientHistory(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div>Phone: <strong className="text-slate-900">{viewPatientHistory.phone}</strong></div>
              <div>CNIC: <strong className="text-slate-900">{viewPatientHistory.cnic || "N/A"}</strong></div>
              <div>Age / Gender: <strong className="text-slate-900">{viewPatientHistory.age} yrs / {viewPatientHistory.gender}</strong></div>
              <div>Blood Group: <strong className="text-teal-700">{viewPatientHistory.bloodGroup || "N/A"}</strong></div>
              <div>Total Visits: <strong className="text-slate-900">{viewPatientHistory.totalVisits}</strong></div>
              <div className="col-span-2">
                Allergies: <strong className="text-red-600">{viewPatientHistory.allergies || "None declared"}</strong>
              </div>
              <div className="col-span-2">
                Medical History: <span className="text-slate-700">{viewPatientHistory.medicalHistory || "None recorded"}</span>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 mb-2">Past Clinical Appointments:</h5>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {appointmentsList
                  .filter((a) => a.patientPhone === viewPatientHistory.phone)
                  .map((a) => (
                    <div
                      key={a.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono text-teal-800 font-bold">{a.appointmentNumber}</span>
                        <span className="text-slate-500 ml-2">{a.appointmentDate} • {a.appointmentTime}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-700">{a.status}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewPatientHistory(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Register Patient */}
      {newPatientModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl text-xs space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h4 className="font-extrabold text-slate-900 text-base">Register New Patient</h4>
              <button onClick={() => setNewPatientModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const body = {
                  name: (form.elements.namedItem("name") as HTMLInputElement).value,
                  phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
                  cnic: (form.elements.namedItem("cnic") as HTMLInputElement).value,
                  email: (form.elements.namedItem("email") as HTMLInputElement).value,
                  age: Number((form.elements.namedItem("age") as HTMLInputElement).value),
                  gender: (form.elements.namedItem("gender") as HTMLSelectElement).value,
                  bloodGroup: (form.elements.namedItem("bloodGroup") as HTMLSelectElement).value,
                  allergies: (form.elements.namedItem("allergies") as HTMLInputElement).value,
                  medicalHistory: (form.elements.namedItem("history") as HTMLInputElement).value,
                };
                const res = await fetch("/api/patients", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(body),
                });
                const data = await res.json();
                if (res.ok) {
                  setPatientsList([data.patient, ...patientsList]);
                  setNewPatientModalOpen(false);
                  alert(`Patient ${data.patient.name} registered with MRN: ${data.patient.mrn}!`);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-slate-700 font-bold block mb-1">Full Name *</label>
                <input name="name" required placeholder="e.g. Tariq Mahmood" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Phone Number *</label>
                  <input name="phone" required placeholder="+92 300 1234567" className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900" />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">CNIC</label>
                  <input name="cnic" placeholder="35202-1234567-1" className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900" />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Email</label>
                  <input name="email" type="email" placeholder="patient@example.com" className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Age</label>
                  <input name="age" type="number" defaultValue="30" className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900" />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Gender</label>
                  <select name="gender" className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Blood Group</label>
                  <select name="bloodGroup" className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900">
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                    <option value="A-">A-</option>
                    <option value="B-">B-</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Allergies</label>
                <input name="allergies" placeholder="e.g. Penicillin, Sulfa" className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900" />
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Medical History</label>
                <input name="history" placeholder="e.g. Diabetes, Hypertension" className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900" />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setNewPatientModalOpen(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl">Save Patient</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Staff Account */}
      {newStaffModalOpen && (
        <StaffUserFormModal
          title="Create Staff Credentials"
          submitLabel="Create Account"
          doctors={doctorsList}
          onClose={() => setNewStaffModalOpen(false)}
          onSubmit={async (payload: StaffUserPayload) => {
            const res = await fetch("/api/users", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) {
              alert(data.error || "Failed to create staff account");
              return;
            }
            await fetchAllData();
            setNewStaffModalOpen(false);
          }}
        />
      )}

      {/* MODAL: Edit Staff Account */}
      {editingStaffUser && (
        <StaffUserFormModal
          title={`Edit ${editingStaffUser.name}`}
          submitLabel="Save Account"
          doctors={doctorsList}
          initial={editingStaffUser}
          onClose={() => setEditingStaffUser(null)}
          onSubmit={async (payload: StaffUserPayload) => {
            const res = await fetch(`/api/users/${editingStaffUser.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) {
              alert(data.error || "Failed to update staff account");
              return;
            }
            await fetchAllData();
            setEditingStaffUser(null);
          }}
        />
      )}

      {/* MODAL: Add Doctor */}
      {newDoctorModalOpen && (
        <DoctorFormModal
          title="Add Specialist Doctor"
          submitLabel="Save Doctor"
          onClose={() => setNewDoctorModalOpen(false)}
          onSubmit={async (payload: DoctorFormPayload) => {
            const res = await fetch("/api/doctors", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok) {
              setDoctorsList([...doctorsList, data.doctor]);
              setNewDoctorModalOpen(false);
            } else {
              alert(data.error || "Failed to save doctor");
            }
          }}
          onUploadPhoto={handleUploadDoctorPhoto}
        />
      )}

      {/* MODAL: Edit Doctor */}
      {editingDoctor && (
        <DoctorFormModal
          title={`Edit ${editingDoctor.name}`}
          submitLabel="Save Changes"
          initial={editingDoctor}
          onClose={() => setEditingDoctor(null)}
          onSubmit={async (payload: DoctorFormPayload) => {
            const ok = await handleUpdateDoctor(editingDoctor.id, payload as Partial<DoctorType>);
            if (ok) setEditingDoctor(null);
          }}
          onUploadPhoto={handleUploadDoctorPhoto}
        />
      )}

      {/* MODAL: Add Service */}
      {newServiceModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl text-xs space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h4 className="font-extrabold text-slate-900 text-base">Add Clinical Service</h4>
              <button onClick={() => setNewServiceModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const body = {
                  name: (form.elements.namedItem("name") as HTMLInputElement).value,
                  category: (form.elements.namedItem("category") as HTMLInputElement).value,
                  price: Number((form.elements.namedItem("price") as HTMLInputElement).value),
                  durationMinutes: Number((form.elements.namedItem("duration") as HTMLInputElement).value),
                  description: (form.elements.namedItem("description") as HTMLTextAreaElement).value,
                  badge: (form.elements.namedItem("badge") as HTMLInputElement).value || null,
                  preparationInstructions: (form.elements.namedItem("prep") as HTMLInputElement).value || null,
                };
                const res = await fetch("/api/services", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(body),
                });
                const data = await res.json();
                if (res.ok) {
                  setServicesList([...servicesList, data.service]);
                  setNewServiceModalOpen(false);
                  alert(`Service ${data.service.name} added!`);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-slate-700 font-bold block mb-1">Service Name *</label>
                <input name="name" required placeholder="e.g. PRP Hair Restoration" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Category *</label>
                  <input name="category" required placeholder="e.g. Dermatology" className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900" />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Consultation Fee (PKR) *</label>
                  <input name="price" type="number" required defaultValue="5000" className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Duration (Minutes)</label>
                  <input name="duration" type="number" defaultValue="30" className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900" />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Badge</label>
                  <input name="badge" placeholder="e.g. Popular, Advanced" className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900" />
                </div>
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Description *</label>
                <textarea name="description" required rows={2} placeholder="Explain procedure protocol and benefits..." className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900" />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setNewServiceModalOpen(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs">Save Service</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Write Blog Post */}
      {newBlogModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl text-xs space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h4 className="font-extrabold text-slate-900 text-base">Write Clinical Article</h4>
              <button onClick={() => setNewBlogModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const body = {
                  title: (form.elements.namedItem("title") as HTMLInputElement).value,
                  category: (form.elements.namedItem("category") as HTMLInputElement).value,
                  authorName: (form.elements.namedItem("author") as HTMLInputElement).value,
                  authorRole: (form.elements.namedItem("authorRole") as HTMLInputElement).value,
                  summary: (form.elements.namedItem("summary") as HTMLTextAreaElement).value,
                  content: (form.elements.namedItem("content") as HTMLTextAreaElement).value,
                  coverImage: (form.elements.namedItem("coverImage") as HTMLInputElement).value.trim() || undefined,
                  readTime: (form.elements.namedItem("readTime") as HTMLInputElement).value || "5 min read",
                  published: true,
                };
                const res = await fetch("/api/blog", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(body),
                });
                const data = await res.json();
                if (res.ok) {
                  setBlogPostsList([data.post, ...blogPostsList]);
                  setNewBlogModalOpen(false);
                  alert(`Article "${data.post.title}" published!`);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-slate-700 font-bold block mb-1">Article Title *</label>
                <input name="title" required placeholder="e.g. Preventing Cardiac Issues in Summer" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Category *</label>
                  <input name="category" required placeholder="e.g. Cardiology" className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900" />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Read Time</label>
                  <input name="readTime" defaultValue="5 min read" className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Author Doctor *</label>
                  <input name="author" required defaultValue="Dr. Ayesha Siddiqui" className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900" />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Author Title</label>
                  <input name="authorRole" defaultValue="Consultant Physician" className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900" />
                </div>
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Summary Excerpt *</label>
                <textarea name="summary" required rows={2} placeholder="Brief excerpt preview..." className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900" />
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Full Article Content *</label>
                <textarea name="content" required rows={4} placeholder="Full clinical advice and guidelines..." className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900" />
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Cover Image URL</label>
                <input name="coverImage" placeholder="https://images.pexels.com/..." className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900" />
                <p className="mt-1 text-[10px] text-slate-400">Optional. A suitable medical image is used automatically if this is left blank.</p>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setNewBlogModalOpen(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs">Publish Article</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add FAQ */}
      {newFaqModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl text-xs space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h4 className="font-extrabold text-slate-900 text-base">Add Frequently Asked Question</h4>
              <button onClick={() => setNewFaqModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const body = {
                  question: (form.elements.namedItem("question") as HTMLInputElement).value,
                  answer: (form.elements.namedItem("answer") as HTMLTextAreaElement).value,
                  category: (form.elements.namedItem("category") as HTMLSelectElement).value,
                  orderNumber: Number((form.elements.namedItem("orderNumber") as HTMLInputElement).value),
                };
                const res = await fetch("/api/faqs", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(body),
                });
                const data = await res.json();
                if (res.ok) {
                  setFaqsList([...faqsList, data.faq]);
                  setNewFaqModalOpen(false);
                  alert("FAQ published successfully!");
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-slate-700 font-bold block mb-1">Question *</label>
                <input name="question" required placeholder="e.g. Do you accept health insurance?" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900" />
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Answer *</label>
                <textarea name="answer" rows={4} required placeholder="Provide a clear and useful answer for patients..." className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Category</label>
                  <select name="category" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900">
                    <option value="General">General</option>
                    <option value="Appointments">Appointments</option>
                    <option value="Pricing & Billing">Pricing & Billing</option>
                    <option value="Services">Services</option>
                    <option value="Diagnostics & Labs">Diagnostics & Labs</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Display Order</label>
                  <input name="orderNumber" type="number" defaultValue={faqsList.length + 1} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900" />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setNewFaqModalOpen(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs">Publish FAQ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
