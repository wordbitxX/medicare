"use client";

import React, { useState } from "react";
import { ClinicSettingsType } from "@/types";
import PatientAuthModal from "./PatientAuthModal";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface PatientLoginPageProps {
  settings: ClinicSettingsType;
}

export default function PatientLoginPage({ settings }: PatientLoginPageProps) {
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        settings={settings}
        onOpenBooking={() => { window.location.href = "/book"; }}
        onOpenTracker={() => { window.location.href = "/track"; }}
      />
      <PatientAuthModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); window.location.href = "/"; }}
        onSuccess={() => { window.location.href = "/patient"; }}
        redirectAfterLogin="/patient"
      />
    </div>
  );
}
