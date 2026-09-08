"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Activity,
  UserCheck,
  Stethoscope,
  Building,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPassword?: string) => {
    if (e) e.preventDefault();
    const loginEmail = customEmail || email;
    const loginPassword = customPassword || password;

    if (!loginEmail || !loginPassword) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid credentials");
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (role: "admin" | "reception" | "doctor") => {
    if (role === "admin") {
      setEmail("admin@medicareplus.demo");
      setPassword("Admin@12345");
      handleLogin(undefined, "admin@medicareplus.demo", "Admin@12345");
    } else if (role === "reception") {
      setEmail("reception@medicareplus.demo");
      setPassword("Reception@12345");
      handleLogin(undefined, "reception@medicareplus.demo", "Reception@12345");
    } else {
      setEmail("doctor@medicareplus.demo");
      setPassword("Doctor@12345");
      handleLogin(undefined, "doctor@medicareplus.demo", "Doctor@12345");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Subtle Medical Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 via-teal-900 to-teal-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-teal-900/10 mb-3">
          <Activity className="w-6 h-6 text-teal-300" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-900 text-[11px] font-bold mb-2">
          <span>WordbitX Healthcare Management System</span>
        </div>

        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Clinic Staff & Doctor Portal
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Authorized hospital administrator, reception, and doctor login
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white border border-slate-200 py-8 px-6 shadow-xl rounded-3xl sm:px-10">
          {/* Quick Demo Login Preset Buttons */}
          <div className="mb-6 pb-6 border-b border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2.5 text-center">
              1-Click Demo Accounts (Select Role):
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("admin")}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 text-center transition-all group hover:border-teal-300"
              >
                <Shield className="w-4 h-4 text-teal-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold text-slate-900 block">Super Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin("reception")}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 text-center transition-all group hover:border-teal-300"
              >
                <UserCheck className="w-4 h-4 text-sky-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold text-slate-900 block">Receptionist</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin("doctor")}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 text-center transition-all group hover:border-teal-300"
              >
                <Stethoscope className="w-4 h-4 text-emerald-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold text-slate-900 block">Doctor</span>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@medicareplus.demo"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
            >
              <span>{loading ? "Authenticating..." : "Sign In to Clinic Dashboard"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-teal-700 transition-colors font-semibold"
            >
              ← Return to Clinic Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
