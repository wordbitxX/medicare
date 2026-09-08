import React from "react";
import { Stethoscope } from "lucide-react";

interface DoctorAvatarProps {
  name: string;
  specialty: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SPECIALTY_GRADIENTS: Record<string, string> = {
  "General Physician": "from-teal-600 via-teal-500 to-emerald-500",
  "Dental Surgery": "from-sky-600 via-blue-500 to-indigo-500",
  "Dermatology & Aesthetics": "from-rose-500 via-pink-500 to-fuchsia-500",
  "Cardiology": "from-red-600 via-rose-500 to-orange-500",
  "Pediatrics & Child Care": "from-amber-500 via-orange-500 to-rose-400",
  "Ophthalmology / Eye Care": "from-indigo-600 via-violet-500 to-purple-500",
  "Physiotherapy & Rehab": "from-emerald-600 via-teal-500 to-cyan-500",
  "General & Laparoscopic Surgery": "from-slate-700 via-slate-600 to-teal-600",
  "Gynecology & Obstetrics": "from-pink-600 via-rose-500 to-red-400",
  "Orthopedic Surgery": "from-blue-700 via-indigo-600 to-slate-600",
  "ENT (Ear, Nose & Throat)": "from-cyan-600 via-sky-500 to-blue-500",
  "Neurology": "from-violet-700 via-purple-600 to-indigo-600",
  "Psychiatry & Mental Health": "from-purple-600 via-fuchsia-500 to-pink-500",
  "Urology": "from-teal-700 via-cyan-600 to-sky-600",
  "Endocrinology & Diabetes": "from-orange-600 via-amber-500 to-yellow-500",
  "Gastroenterology": "from-amber-600 via-orange-600 to-red-600",
  "Breast Surgery": "from-pink-600 via-rose-500 to-red-400",
  "Rheumatology": "from-violet-600 via-purple-500 to-pink-500",
  "Nephrology": "from-blue-600 via-cyan-600 to-teal-600",
  "Oncology": "from-red-700 via-rose-600 to-pink-600",
  "Plastic Surgery": "from-fuchsia-600 via-pink-600 to-rose-500",
  "Nutrition & Dietetics": "from-emerald-500 via-green-600 to-lime-600",
  "Pulmonology": "from-sky-700 via-blue-700 to-indigo-700",
  "Haematology": "from-red-600 via-red-700 to-rose-700",
  "Neurosurgery": "from-slate-800 via-slate-700 to-violet-800",
  "Gynae-Oncology": "from-rose-700 via-pink-700 to-purple-700",
  "Bariatric Surgery": "from-orange-700 via-red-600 to-rose-600",
  "Osteoporosis & Bone Health": "from-stone-600 via-amber-700 to-orange-700",
  "Infertility Specialist": "from-pink-600 via-rose-500 to-red-400",
  "Maternal Fetal Medicine": "from-pink-600 via-rose-600 to-red-500",
  "Reproductive Endocrinology": "from-orange-600 via-amber-500 to-yellow-500",
  "Uro-Gynaecology": "from-pink-600 via-rose-500 to-purple-600",
};

const FALLBACK_GRADIENTS = [
  "from-teal-600 to-emerald-500",
  "from-blue-600 to-indigo-500",
  "from-rose-600 to-pink-500",
  "from-amber-600 to-orange-500",
  "from-violet-600 to-purple-500",
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  return name
    .replace(/^Dr\.?\s*/i, "")
    .replace(/^Prof\.?\s*/i, "")
    .split(" ")
    .filter((w) => w.length > 1)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const sizeClasses: Record<string, string> = {
  sm: "h-10 w-10 text-[11px]",
  md: "h-14 w-14 text-sm",
  lg: "h-20 w-20 text-lg",
  xl: "h-28 w-28 text-2xl",
};

const imgSizeClasses: Record<string, string> = {
  sm: "h-10 w-10",
  md: "h-14 w-14",
  lg: "h-20 w-20",
  xl: "h-28 w-28",
};

export default function DoctorAvatar({ name, specialty, avatarUrl, size = "md", className = "" }: DoctorAvatarProps) {
  const gradient =
    SPECIALTY_GRADIENTS[specialty] ||
    FALLBACK_GRADIENTS[hashString(specialty) % FALLBACK_GRADIENTS.length];
  const initials = getInitials(name);

  if (avatarUrl) {
    return (
      <div className={`relative shrink-0 ${imgSizeClasses[size]} ${className}`}>
        <img
          src={avatarUrl}
          alt={name}
          className={`h-full w-full rounded-full object-cover object-top shadow-lg ring-4 ring-white transition-transform duration-300 group-hover:scale-105 ${imgSizeClasses[size]}`}
          loading="lazy"
        />
        <span className="absolute -bottom-0.5 -right-0.5 flex h-[32%] w-[32%] items-center justify-center rounded-full border-2 border-white bg-white shadow-sm">
          <Stethoscope className="h-[55%] w-[55%] text-teal-600" strokeWidth={2.5} />
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-extrabold text-white shadow-lg ring-4 ring-white transition-transform duration-300 group-hover:scale-105 ${gradient} ${sizeClasses[size]} ${className}`}
    >
      <span className="drop-shadow-sm">{initials}</span>
      <span className="absolute -bottom-0.5 -right-0.5 flex h-[32%] w-[32%] items-center justify-center rounded-full border-2 border-white bg-white shadow-sm">
        <Stethoscope className="h-[55%] w-[55%] text-teal-600" strokeWidth={2.5} />
      </span>
    </div>
  );
}
