import { DoctorType } from "@/types";

// Maps a service's broad category to the keyword(s) used to fuzzy-match a doctor's specialty.
// This keeps the two datasets (services.category vs doctors.specialty) loosely coupled
// while still producing accurate "book this service -> see matching doctors" results.
const CATEGORY_TO_SPECIALTY_KEYWORDS: Record<string, string[]> = {
  "General Medicine": ["General Physician"],
  "Dental Care": ["Dental"],
  "Dermatology": ["Dermatology"],
  "Cardiology": ["Cardiology"],
  "Pediatrics": ["Pediatric"],
  "Ophthalmology": ["Ophthalmology", "Eye"],
  "Physiotherapy": ["Physiotherapy"],
  "General Surgery": ["Surgery"],
  "Diagnostics": ["General Physician"],
  "Gynecology": ["Gynecology"],
  "Orthopedics": ["Orthopedic"],
  "ENT": ["ENT"],
  "Neurology": ["Neurology"],
  "Psychiatry": ["Psychiatry"],
  "Urology": ["Urology"],
  "Endocrinology": ["Endocrinology"],
};

/** The specialty name used for General Physician / walk-in OPD doctors. */
export const OPD_SPECIALTY = "General Physician";

export function getKeywordsForCategory(category: string): string[] {
  if (CATEGORY_TO_SPECIALTY_KEYWORDS[category]) {
    return CATEGORY_TO_SPECIALTY_KEYWORDS[category];
  }
  // Fallback: fuzzy-match using the category text itself
  const firstWord = category.split(/[\s&/]+/)[0];
  return [firstWord];
}

/**
 * Returns the subset of doctors whose specialty matches the given service category.
 * Falls back to General Physician (OPD) doctors if nothing matches, so a patient
 * always has someone to book instead of hitting an empty state.
 */
export function matchDoctorsForCategory(doctors: DoctorType[], category: string): DoctorType[] {
  const keywords = getKeywordsForCategory(category).map((k) => k.toLowerCase());
  const matched = doctors.filter((doc) =>
    keywords.some((kw) => doc.specialty.toLowerCase().includes(kw))
  );
  if (matched.length > 0) return matched;
  return doctors.filter((doc) => doc.specialty === OPD_SPECIALTY);
}

/** Returns General Physician / OPD doctors — recommended for patients unsure which specialist to see. */
export function getOpdDoctors(doctors: DoctorType[]): DoctorType[] {
  return doctors.filter((doc) => doc.specialty === OPD_SPECIALTY);
}
