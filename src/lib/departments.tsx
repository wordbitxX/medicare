import {
  Stethoscope,
  HeartPulse,
  Sparkles,
  Smile,
  Eye,
  Baby,
  Footprints,
  Scissors,
  Bone,
  Ear,
  Brain,
  Flower2,
  Droplets,
  Syringe,
  FlaskConical,
  Apple,
  Heart,
  Wind,
  Bug,
  Activity,
  type LucideIcon,
} from "lucide-react";

export interface DepartmentInfo {
  key: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  description: string;
  gradient: string;
}

export const OPD_DEPARTMENT: DepartmentInfo = {
  key: "General Physician",
  label: "Normal Checkup (OPD)",
  shortLabel: "OPD",
  icon: Stethoscope,
  description:
    "General Physician for routine checkups, fever, flu, infections and referrals. Best first step if you're unsure which specialist to see.",
  gradient: "from-teal-600 via-emerald-600 to-teal-700",
};

export const DEPARTMENTS: DepartmentInfo[] = [
  {
    key: "Cardiology",
    label: "Cardiology",
    shortLabel: "Cardiology",
    icon: HeartPulse,
    description: "ECG, echo, hypertension and cardiac risk assessment.",
    gradient: "from-rose-600 via-red-600 to-orange-600",
  },
  {
    key: "Dental Surgery",
    label: "Dental Care & Surgery",
    shortLabel: "Dental",
    icon: Smile,
    description: "Cleanings, root canal, implants and oral surgery.",
    gradient: "from-sky-600 via-blue-600 to-indigo-600",
  },
  {
    key: "Dermatology & Aesthetics",
    label: "Skin & Aesthetics",
    shortLabel: "Skin",
    icon: Sparkles,
    description: "Acne, laser therapy, eczema and cosmetic dermatology.",
    gradient: "from-rose-500 via-pink-600 to-fuchsia-600",
  },
  {
    key: "Pediatrics & Child Care",
    label: "Pediatrics & Child Care",
    shortLabel: "Children",
    icon: Baby,
    description: "Vaccinations, growth monitoring and childhood illnesses.",
    gradient: "from-amber-500 via-orange-600 to-rose-500",
  },
  {
    key: "Ophthalmology / Eye Care",
    label: "Eye Care",
    shortLabel: "Eye",
    icon: Eye,
    description: "Vision checks, cataract, glaucoma and retina care.",
    gradient: "from-indigo-600 via-violet-600 to-purple-600",
  },
  {
    key: "Physiotherapy & Rehab",
    label: "Physiotherapy & Rehab",
    shortLabel: "Physio",
    icon: Footprints,
    description: "Back pain, sports injuries and post-surgery recovery.",
    gradient: "from-emerald-600 via-teal-600 to-cyan-600",
  },
  {
    key: "General & Laparoscopic Surgery",
    label: "General & Laparoscopic Surgery",
    shortLabel: "Surgery",
    icon: Scissors,
    description: "Hernia, gallbladder and minimally-invasive procedures.",
    gradient: "from-slate-700 via-slate-600 to-teal-700",
  },
  {
    key: "Gynecology & Obstetrics",
    label: "Women's Health & Gynecology",
    shortLabel: "Women's Health",
    icon: Flower2,
    description: "Antenatal care, family planning and screenings.",
    gradient: "from-pink-600 via-rose-600 to-red-500",
  },
  {
    key: "Orthopedic Surgery",
    label: "Orthopedics & Joints",
    shortLabel: "Bones",
    icon: Bone,
    description: "Fractures, joint replacement and sports injuries.",
    gradient: "from-blue-700 via-indigo-700 to-slate-700",
  },
  {
    key: "ENT (Ear, Nose & Throat)",
    label: "Ear, Nose & Throat",
    shortLabel: "ENT",
    icon: Ear,
    description: "Ear infections, sinus issues and hearing loss.",
    gradient: "from-cyan-600 via-sky-600 to-blue-600",
  },
  {
    key: "Neurology",
    label: "Neurology & Brain",
    shortLabel: "Neurology",
    icon: Brain,
    description: "Migraine, epilepsy, stroke follow-up and nerve disorders.",
    gradient: "from-violet-700 via-purple-700 to-indigo-700",
  },
  {
    key: "Psychiatry & Mental Health",
    label: "Mental Health & Psychiatry",
    shortLabel: "Mental Health",
    icon: Brain,
    description: "Anxiety, depression, stress and sleep counseling.",
    gradient: "from-purple-600 via-fuchsia-600 to-pink-600",
  },
  {
    key: "Urology",
    label: "Urology & Kidney",
    shortLabel: "Urology",
    icon: Droplets,
    description: "Kidney stones, urinary tract and prostate care.",
    gradient: "from-teal-700 via-cyan-700 to-sky-700",
  },
  {
    key: "Endocrinology & Diabetes",
    label: "Diabetes & Endocrinology",
    shortLabel: "Diabetes",
    icon: Syringe,
    description: "Diabetes, thyroid and hormonal disorders.",
    gradient: "from-orange-600 via-amber-600 to-yellow-600",
  },
  {
    key: "Gastroenterology",
    label: "Gastroenterology",
    shortLabel: "Gastro",
    icon: FlaskConical,
    description: "Stomach, liver and digestive system disorders.",
    gradient: "from-amber-600 via-orange-600 to-red-600",
  },
  {
    key: "Breast Surgery",
    label: "Breast Surgery",
    shortLabel: "Breast",
    icon: Heart,
    description: "Breast cancer screening, surgery and care.",
    gradient: "from-pink-600 via-rose-500 to-red-400",
  },
  {
    key: "Rheumatology",
    label: "Rheumatology",
    shortLabel: "Rheuma",
    icon: Bone,
    description: "Arthritis, autoimmune and joint disorders.",
    gradient: "from-violet-600 via-purple-500 to-pink-500",
  },
  {
    key: "Nephrology",
    label: "Nephrology",
    shortLabel: "Kidney",
    icon: Droplets,
    description: "Kidney disease, dialysis and renal care.",
    gradient: "from-blue-600 via-cyan-600 to-teal-600",
  },
  {
    key: "Oncology",
    label: "Oncology / Cancer Care",
    shortLabel: "Cancer",
    icon: Activity,
    description: "Cancer diagnosis, treatment and follow-up.",
    gradient: "from-red-700 via-rose-600 to-pink-600",
  },
  {
    key: "Plastic Surgery",
    label: "Plastic & Reconstructive Surgery",
    shortLabel: "Plastic",
    icon: Sparkles,
    description: "Reconstructive and cosmetic surgery.",
    gradient: "from-fuchsia-600 via-pink-600 to-rose-500",
  },
  {
    key: "Nutrition & Dietetics",
    label: "Nutrition & Dietetics",
    shortLabel: "Nutrition",
    icon: Apple,
    description: "Diet planning, weight management and nutrition.",
    gradient: "from-emerald-500 via-green-600 to-lime-600",
  },
  {
    key: "Pulmonology",
    label: "Pulmonology / Chest",
    shortLabel: "Chest",
    icon: Wind,
    description: "Asthma, lung infections and respiratory care.",
    gradient: "from-sky-700 via-blue-700 to-indigo-700",
  },
  {
    key: "Haematology",
    label: "Haematology / Blood",
    shortLabel: "Blood",
    icon: Droplets,
    description: "Blood disorders, anemia and hematologic care.",
    gradient: "from-red-600 via-red-700 to-rose-700",
  },
  {
    key: "Neurosurgery",
    label: "Neurosurgery",
    shortLabel: "Neuro Surgery",
    icon: Brain,
    description: "Brain and spine surgical procedures.",
    gradient: "from-slate-800 via-slate-700 to-violet-800",
  },
  {
    key: "Gynae-Oncology",
    label: "Gynecologic Oncology",
    shortLabel: "Gynae Oncology",
    icon: Flower2,
    description: "Women's cancer screening and treatment.",
    gradient: "from-rose-700 via-pink-700 to-purple-700",
  },
  {
    key: "Bariatric Surgery",
    label: "Bariatric & Weight Loss Surgery",
    shortLabel: "Bariatric",
    icon: Activity,
    description: "Weight loss surgery and metabolic care.",
    gradient: "from-orange-700 via-red-600 to-rose-600",
  },
  {
    key: "Osteoporosis & Bone Health",
    label: "Osteoporosis & Bone Health",
    shortLabel: "Bone Health",
    icon: Bone,
    description: "Bone density, osteoporosis and fracture prevention.",
    gradient: "from-stone-600 via-amber-700 to-orange-700",
  },
];

export function getDepartmentBySpecialty(specialty: string): DepartmentInfo {
  return DEPARTMENTS.find((d) => d.key === specialty) ?? OPD_DEPARTMENT;
}

export function getAllDepartmentInfos(): DepartmentInfo[] {
  return [OPD_DEPARTMENT, ...DEPARTMENTS];
}

export function mapServiceCategoryToDepartment(category: string): string | null {
  const normalized = category.toLowerCase().trim();
  if (normalized.includes("general")) return "General Physician";
  if (normalized.includes("dental")) return "Dental Surgery";
  if (normalized.includes("derma") || normalized.includes("skin")) return "Dermatology & Aesthetics";
  if (normalized.includes("cardio") || normalized.includes("heart")) return "Cardiology";
  if (normalized.includes("pediatric") || normalized.includes("child")) return "Pediatrics & Child Care";
  if (normalized.includes("ophthalm") || normalized.includes("eye")) return "Ophthalmology / Eye Care";
  if (normalized.includes("physio") || normalized.includes("rehab")) return "Physiotherapy & Rehab";
  if (normalized.includes("surg")) return "General & Laparoscopic Surgery";
  if (normalized.includes("gyn") || normalized.includes("women")) return "Gynecology & Obstetrics";
  if (normalized.includes("ortho") || normalized.includes("joint")) return "Orthopedic Surgery";
  if (normalized.includes("ent") || normalized.includes("ear")) return "ENT (Ear, Nose & Throat)";
  if (normalized.includes("neuro") && !normalized.includes("surgery")) return "Neurology";
  if (normalized.includes("psych")) return "Psychiatry & Mental Health";
  if (normalized.includes("urolog")) return "Urology";
  if (normalized.includes("endocrine") || normalized.includes("diabet")) return "Endocrinology & Diabetes";
  if (normalized.includes("gastro")) return "Gastroenterology";
  if (normalized.includes("breast")) return "Breast Surgery";
  if (normalized.includes("rheuma")) return "Rheumatology";
  if (normalized.includes("nephro")) return "Nephrology";
  if (normalized.includes("oncolog") && !normalized.includes("gynae")) return "Oncology";
  if (normalized.includes("plastic")) return "Plastic Surgery";
  if (normalized.includes("nutrition") || normalized.includes("diet")) return "Nutrition & Dietetics";
  if (normalized.includes("pulmon") || normalized.includes("chest") || normalized.includes("lung")) return "Pulmonology";
  if (normalized.includes("haemato") || normalized.includes("blood")) return "Haematology";
  if (normalized.includes("neurosurgery")) return "Neurosurgery";
  if (normalized.includes("bariatric") || normalized.includes("weight")) return "Bariatric Surgery";
  if (normalized.includes("osteoporosis") || normalized.includes("bone health")) return "Osteoporosis & Bone Health";
  return null;
}
