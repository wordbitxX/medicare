"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ArrowRightCircle,
  CheckCircle2,
  ChevronLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  MessageCircle,
  Phone,
  ShieldCheck,
  X,
} from "lucide-react";
import { normalisePhone } from "@/lib/phone";

type Mode = "choice" | "login-phone" | "login-otp" | "signup-phone" | "signup-otp" | "signup-form" | "success";

interface PatientAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (account: { firstName: string; lastName: string; phone: string }) => void;
  onSkip?: () => void;
  redirectAfterLogin?: string; // URL to navigate after login
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function PatientAuthModal({ isOpen, onClose, onSuccess, onSkip, redirectAfterLogin }: PatientAuthModalProps) {
  const [mode, setMode] = useState<Mode>("choice");
  const [phone, setPhone] = useState("");
  const [normPhone, setNormPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Signup form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cnic, setCnic] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [city, setCity] = useState("Lahore");
  const [address, setAddress] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [allergies, setAllergies] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [demoOtp, setDemoOtp] = useState(""); // shown on screen until SMS is connected
  const [deliveredVia, setDeliveredVia] = useState<"" | "whatsapp" | "sms" | "webhook">("");
  const [showGoToLogin, setShowGoToLogin] = useState(false);
  const [loginTab, setLoginTab] = useState<"otp" | "password">("otp");
  const [loginPassword, setLoginPassword] = useState("");
  const [successAccount, setSuccessAccount] = useState<{ firstName: string; lastName: string; phone: string } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setMode("choice");
      setErrorMsg("");
      setPhone("");
      setOtp(["", "", "", "", "", ""]);
      setDemoOtp("");
      setDeliveredVia("");
      setShowGoToLogin(false);
      setLoginTab("otp");
      setLoginPassword("");
      setNormPhone("");
      setLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  if (!isOpen) return null;

  const otpString = otp.join("");
  const otpReady = otpString.length === 6;

  const handleOtpChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = clean;
    setOtp(next);
    if (clean && index < 5) otpRefs.current[index + 1]?.focus();
    if (!clean && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = text.split("").concat(Array(6 - text.length).fill(""));
    setOtp(next);
    const focusIdx = Math.min(text.length, 5);
    otpRefs.current[focusIdx]?.focus();
  };

  const sendOtp = async (purpose: "login" | "signup") => {
    setErrorMsg("");
    setShowGoToLogin(false);
    setLoading(true);
    const norm = normalisePhone(phone);
    setNormPhone(norm);
    try {
      const res = await fetch("/api/patient-auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: norm, purpose }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409 && purpose === "signup") setShowGoToLogin(true);
        throw new Error(data.error);
      }
      // Demo fallback: server returns the code on-screen when no SMS
      // gateway is configured. Auto-fill it so the user just taps Verify.
      if (data.otp) {
        const digits = String(data.otp).split("").slice(0, 6);
        setOtp(digits.concat(Array(6 - digits.length).fill("")));
        setDemoOtp(String(data.otp));
        setDeliveredVia("");
      } else {
        setOtp(["", "", "", "", "", ""]);
        setDemoOtp("");
        setDeliveredVia((data.channel as any) || "");
      }
      setResendCooldown(60);
      setMode(purpose === "login" ? "login-otp" : "signup-otp");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    setErrorMsg("");
    if (!loginPassword) {
      setErrorMsg("Please enter your password.");
      return;
    }
    setLoading(true);
    const norm = normalisePhone(phone);
    setNormPhone(norm);
    try {
      const res = await fetch("/api/patient-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: norm, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccessAccount(data.account);
      setMode("success");
      setTimeout(() => {
        onSuccess(data.account);
        if (redirectAfterLogin) window.location.href = redirectAfterLogin;
        else onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyAndLogin = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await fetch("/api/patient-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normPhone, otp: otpString }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccessAccount(data.account);
      setMode("success");
      setTimeout(() => {
        onSuccess(data.account);
        if (redirectAfterLogin) window.location.href = redirectAfterLogin;
        else onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg("First name and last name are required.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg("Please set a password of at least 6 characters so you can sign in later.");
      return;
    }
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await fetch("/api/patient-auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: normPhone,
          // OTP is optional — only sent when the user typed the on-screen code
          otp: otpString.length === 6 ? otpString : undefined,
          password,
          firstName,
          lastName,
          cnic: cnic || undefined,
          email: email || undefined,
          gender,
          dateOfBirth: dob || undefined,
          bloodGroup: bloodGroup || undefined,
          city,
          address: address || undefined,
          emergencyContact: emergencyContact || undefined,
          allergies: allergies || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccessAccount(data.account);
      setMode("success");
      setTimeout(() => {
        onSuccess(data.account);
        if (redirectAfterLogin) window.location.href = redirectAfterLogin;
        else onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Signup phone step: open the form IMMEDIATELY so account creation
  // never blocks. OTP is sent in the background and offered as an
  // optional field inside the form for instant verification.
  const continueToSignupForm = async () => {
    setErrorMsg("");
    setShowGoToLogin(false);
    const norm = normalisePhone(phone);
    if (norm.replace(/\D/g, "").length < 10) {
      setErrorMsg("Please enter a valid phone number.");
      return;
    }
    setNormPhone(norm);
    setMode("signup-form");
    // Background: send OTP (best-effort). If number already registered,
    // surface the Go-to-Login shortcut without blocking the form.
    try {
      const res = await fetch("/api/patient-auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: norm, purpose: "signup" }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) setShowGoToLogin(true);
        return;
      }
      if (data.otp) {
        const digits = String(data.otp).split("").slice(0, 6);
        setOtp(digits.concat(Array(6 - digits.length).fill("")));
        setDemoOtp(String(data.otp));
        setDeliveredVia("");
      } else {
        setDemoOtp("");
        setDeliveredVia((data.channel as any) || "");
      }
    } catch {
      // Silent — OTP is optional, form already open.
    }
  };

  const InputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10";

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/70 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl sm:border sm:border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#0A2540] px-5 py-4 text-white">
          <div className="flex items-center gap-2.5">
            {!["choice", "success"].includes(mode) && (
              <button
                onClick={() => {
                  setErrorMsg("");
                  if (mode.includes("otp")) setMode(mode === "login-otp" ? "login-phone" : "signup-phone");
                  else if (mode === "signup-form") setMode("signup-otp");
                  else setMode("choice");
                }}
                className="mr-1 rounded-lg p-1 hover:bg-white/10"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <ShieldCheck className="h-5 w-5 text-teal-300" />
            <div>
              <h3 className="text-sm font-extrabold">
                {mode === "choice" && "Patient Account"}
                {mode === "login-phone" && "Sign In"}
                {mode === "login-otp" && "Enter OTP"}
                {mode === "signup-phone" && "Create Account"}
                {mode === "signup-otp" && "Verify Phone"}
                {mode === "signup-form" && "Your Details"}
                {mode === "success" && "Welcome!"}
              </h3>
              <p className="text-[11px] text-white/50">Secured with end-to-end encryption</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[80vh] overflow-y-auto p-5 sm:max-h-[70vh]">
          {errorMsg && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
              {errorMsg}
            </div>
          )}

          {/* Choice */}
          {mode === "choice" && (
            <div className="space-y-3 py-2">
              <p className="text-sm text-slate-600">
                Sign in to view your appointments, prescriptions and medical history, or create a new account.
              </p>
              <button
                onClick={() => { setErrorMsg(""); setMode("login-phone"); }}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-teal-300 hover:bg-teal-50"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">Sign In</p>
                  <p className="text-xs text-slate-500">Already have an account? Login with OTP.</p>
                </div>
                <Phone className="h-5 w-5 text-teal-600" />
              </button>
              <button
                onClick={() => { setErrorMsg(""); setMode("signup-phone"); }}
                className="flex w-full items-center justify-between rounded-2xl border border-teal-200 bg-teal-50/50 p-4 text-left transition hover:bg-teal-100/60"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">Create Account</p>
                  <p className="text-xs text-slate-500">New patient? Register in 60 seconds.</p>
                </div>
                <ShieldCheck className="h-5 w-5 text-teal-600" />
              </button>
              {onSkip && (
                <button
                  onClick={onSkip}
                  className="group w-full rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-50 to-amber-100/70 p-4 text-center shadow-sm ring-2 ring-amber-300/40 transition hover:from-amber-100 hover:to-amber-200/70 hover:shadow-md"
                >
                  <span className="flex items-center justify-center gap-2 text-sm font-extrabold text-amber-900">
                    <ArrowRightCircle className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    Skip for now — Continue as Guest
                  </span>
                  <span className="mt-1 block text-[11px] font-semibold text-amber-800/90">
                    No OTP, no password — your details will still be saved to clinic records at booking.
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Phone step (login/signup) */}
          {(mode === "login-phone" || mode === "signup-phone") && (
            <div className="space-y-4 py-2">
              {mode === "login-phone" && (
                <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => { setLoginTab("otp"); setErrorMsg(""); }}
                    className={`rounded-lg py-2 text-xs font-bold transition ${loginTab === "otp" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"}`}
                  >
                    OTP Login
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLoginTab("password"); setErrorMsg(""); }}
                    className={`rounded-lg py-2 text-xs font-bold transition ${loginTab === "password" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"}`}
                  >
                    Password Login
                  </button>
                </div>
              )}

              <p className="text-sm text-slate-600">
                {mode === "login-phone"
                  ? loginTab === "otp"
                    ? "Enter your registered WhatsApp/mobile number to receive a one-time code."
                    : "Enter your registered number and the password you set during signup."
                  : "Enter your WhatsApp/mobile number to verify your identity."}
              </p>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Phone / WhatsApp Number *
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="03XX-XXXXXXX"
                    className={`${InputCls} pl-10`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && phone.replace(/\D/g, "").length >= 10) {
                        if (mode === "login-phone" && loginTab === "password") handlePasswordLogin();
                        else sendOtp(mode === "login-phone" ? "login" : "signup");
                      }
                    }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">Format: 03XX XXXXXXX (Pakistan mobile)</p>
              </div>

              {mode === "login-phone" && loginTab === "password" && (
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Your account password"
                      className={`${InputCls} pl-10 pr-10`}
                      autoComplete="current-password"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handlePasswordLogin();
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <button
                    onClick={handlePasswordLogin}
                    disabled={loading || phone.replace(/\D/g, "").length < 10 || !loginPassword}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A2540] px-6 py-3.5 text-sm font-bold text-white shadow-md disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                    {loading ? "Signing In..." : "Sign In with Password"}
                  </button>
                </div>
              )}

              {mode === "signup-phone" && (
                <button
                  onClick={continueToSignupForm}
                  disabled={phone.replace(/\D/g, "").length < 10}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A2540] px-6 py-3.5 text-sm font-bold text-white shadow-md disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Continue
                </button>
              )}

              {mode === "login-phone" && loginTab === "otp" && (
                <button
                  onClick={() => sendOtp("login")}
                  disabled={loading || phone.replace(/\D/g, "").length < 10}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A2540] px-6 py-3.5 text-sm font-bold text-white shadow-md disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
                  {loading ? "Sending OTP..." : "Send OTP Code"}
                </button>
              )}

              {showGoToLogin && (
                <button
                  onClick={() => {
                    setErrorMsg("");
                    setShowGoToLogin(false);
                    setLoginTab("otp");
                    setMode("login-phone");
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-teal-600 bg-teal-50 px-6 py-3 text-sm font-bold text-teal-800 transition hover:bg-teal-100"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Account exists — Go to Login
                </button>
              )}

              {onSkip && (
                <button
                  onClick={onSkip}
                  className="w-full rounded-xl border-2 border-amber-400/70 bg-amber-50 py-2.5 text-center text-xs font-extrabold text-amber-900 ring-1 ring-amber-300/40 transition hover:bg-amber-100"
                >
                  Skip for now — Continue as Guest
                </button>
              )}
            </div>
          )}

          {/* OTP step */}
          {(mode === "login-otp" || mode === "signup-otp") && (
             <div className="space-y-4 py-2">
               <div>
                 <p className="text-sm font-semibold text-slate-900">
                   Enter the 6-digit OTP
                 </p>
                 <p className="mt-0.5 text-xs text-slate-500">
                   For <span className="font-mono font-bold text-teal-700">{phone}</span>
                 </p>
               </div>

                {/* ── Demo OTP box ─────────────────────────────────────────── */}
                {demoOtp ? (
                  <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1">
                      Your OTP Code — Demo Mode (No SMS charges)
                    </p>
                    <div className="flex items-center justify-center gap-3 py-1">
                      <p className="font-mono text-3xl font-black tracking-[0.25em] text-amber-900">
                        {demoOtp}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            navigator.clipboard?.writeText(demoOtp);
                          } catch {}
                        }}
                        className="rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-[11px] font-bold text-amber-800 hover:bg-amber-100"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-[10px] text-amber-700 text-center mt-1">
                      Code auto-filled below — just tap Verify. (Demo me SMS nahi aata; yehi screen wala code aapka asli code hai.)
                    </p>
                  </div>
                ) : deliveredVia ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
                    <p className="text-xs font-bold text-emerald-800">
                      OTP sent to your {deliveredVia === "whatsapp" ? "WhatsApp" : "phone via SMS"} ✓
                    </p>
                    <p className="mt-1 text-[11px] text-emerald-700">
                      Enter the 6-digit code you received below.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-[11px] text-slate-500">
                    OTP sent. If code box is empty above, tap Resend OTP below.
                  </div>
                )}
                {/* ─────────────────────────────────────────────────────────── */}

                <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="h-12 w-11 rounded-xl border-2 border-slate-200 bg-slate-50 text-center text-lg font-black tracking-widest text-[#0A2540] focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/15 sm:h-13 sm:w-12"
                    />
                  ))}
                </div>

                <button
                  onClick={verifyAndLogin}
                  disabled={loading || !otpReady}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A2540] px-6 py-3.5 text-sm font-bold text-white shadow-md disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </button>

               <div className="text-center text-xs text-slate-500">
                 {resendCooldown > 0 ? (
                   <span>Resend OTP in {resendCooldown}s</span>
                 ) : (
                   <button
                     onClick={() => sendOtp(mode === "login-otp" ? "login" : "signup")}
                     className="font-bold text-teal-700 hover:underline"
                   >
                     Resend OTP
                   </button>
                 )}
               </div>
             </div>
          )}

          {/* Signup form */}
          {mode === "signup-form" && (
            <form onSubmit={handleSignup} className="space-y-4 py-1">
              {demoOtp ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="text-[11px] font-bold text-amber-800">
                    Your verification code: <span className="font-mono text-sm tracking-[0.2em]">{demoOtp}</span>
                  </p>
                  <p className="mt-0.5 text-[10px] text-amber-700">
                    Optional — enter it below to get a Verified badge instantly. You can register without it too.
                  </p>
                </div>
              ) : deliveredVia ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[11px] font-semibold text-emerald-800">
                  OTP sent to your {deliveredVia === "whatsapp" ? "WhatsApp" : "phone"} — enter it below for instant verification (optional).
                </div>
              ) : null}

              {showGoToLogin && (
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg("");
                    setShowGoToLogin(false);
                    setLoginTab("otp");
                    setMode("login-phone");
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-teal-600 bg-teal-50 px-6 py-3 text-sm font-bold text-teal-800 transition hover:bg-teal-100"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  This number is registered — Go to Login
                </button>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">First Name *</label>
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="Ahmed" className={InputCls} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">Last Name *</label>
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder="Khan" className={InputCls} />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">CNIC</label>
                <input value={cnic} onChange={(e) => setCnic(e.target.value)} placeholder="35202-1234567-1" className={InputCls} />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Email (Optional)</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="patient@email.com" className={InputCls} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className={InputCls}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">Blood Group</label>
                  <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className={InputCls}>
                    <option value="">—</option>
                    {BLOOD_GROUPS.map((bg) => <option key={bg}>{bg}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">Date of Birth</label>
                  <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={InputCls} />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">City</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Lahore" className={InputCls} />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Postal Address</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House 12, Street 3, Model Town" className={InputCls} />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Emergency Contact Number</label>
                <input value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} placeholder="03XX XXXXXXX" className={InputCls} />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Known Allergies</label>
                <input value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="e.g. Penicillin, Sulfa (leave blank if none)" className={InputCls} />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Set a Password * <span className="font-normal text-slate-400">(required — for future sign-ins)</span>
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    minLength={6}
                    className={`${InputCls} pl-10 pr-10`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Verification Code <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  value={otpString}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 6).split("");
                    setOtp(digits.concat(Array(6 - digits.length).fill("")));
                  }}
                  placeholder="6-digit code (if you received one)"
                  inputMode="numeric"
                  className={InputCls}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A2540] px-6 py-4 text-sm font-bold text-white shadow-md disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                {loading ? "Creating Account..." : "Create Secure Account"}
              </button>
            </form>
          )}

          {/* Success */}
          {mode === "success" && successAccount && (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Welcome, {successAccount.firstName}!
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Redirecting to your patient dashboard...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
