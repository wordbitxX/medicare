import { db } from "./index";
import { doctors, services } from "./schema";
import { sql } from "drizzle-orm";

// Name pools for generating realistic, unique Pakistani doctor names
const MALE_FIRST = [
  "Ahmed", "Ali", "Hassan", "Bilal", "Usman", "Hamza", "Omar", "Imran", "Kashif", "Waqas",
  "Faisal", "Tariq", "Adeel", "Salman", "Zeeshan", "Asad", "Junaid", "Naveed", "Shahzad", "Rizwan",
  "Fahad", "Kamran", "Nadeem", "Aamir", "Yasir", "Sohail", "Adnan", "Farrukh", "Jawad", "Saad",
  "Danish", "Umair", "Arslan", "Haroon", "Shoaib",
];
const FEMALE_FIRST = [
  "Ayesha", "Zainab", "Sana", "Fatima", "Amna", "Hina", "Mahnoor", "Iqra", "Rabia", "Anum",
  "Nida", "Farah", "Saba", "Sadia", "Bushra", "Nazia", "Rida", "Sidra", "Komal", "Mariam",
  "Aliya", "Erum", "Shazia", "Uzma", "Noreen", "Lubna", "Samina", "Rukhsana", "Tania", "Warda",
  "Sobia", "Maryam", "Kiran", "Sundas", "Momina",
];
const LAST_NAMES = [
  "Khan", "Malik", "Chaudhry", "Sheikh", "Butt", "Raza", "Qureshi", "Siddiqui", "Farooq", "Hussain",
  "Ahmad", "Iqbal", "Baig", "Awan", "Cheema", "Bhatti", "Mirza", "Abbasi", "Rana", "Javed",
  "Riaz", "Ansari", "Warraich", "Gill", "Soomro", "Dar", "Niazi", "Khokhar", "Bajwa", "Zafar",
];

const OPD_ROOMS = ["Room 101", "Room 102", "Room 103", "Room 104", "Room 105", "Room 106", "Room 201", "Room 202", "Room 203", "Room 204"];
const DAY_PATTERNS = [
  "Mon,Tue,Wed,Thu,Fri",
  "Mon,Tue,Wed,Thu,Fri,Sat",
  "Mon,Wed,Fri,Sat",
  "Tue,Wed,Thu,Fri,Sat",
  "Mon,Tue,Thu,Fri",
  "Mon,Wed,Thu,Sat",
];
const SHIFTS: Array<{ start: string; end: string }> = [
  { start: "09:00 AM", end: "02:00 PM" },
  { start: "09:00 AM", end: "03:00 PM" },
  { start: "10:00 AM", end: "04:00 PM" },
  { start: "11:00 AM", end: "05:00 PM" },
  { start: "01:00 PM", end: "06:00 PM" },
  { start: "02:00 PM", end: "07:00 PM" },
  { start: "02:00 PM", end: "08:00 PM" },
  { start: "03:00 PM", end: "09:00 PM" },
  { start: "04:00 PM", end: "09:00 PM" },
];

interface SpecialtyTemplate {
  specialty: string;
  count: number;
  qualifications: string[];
  bioTemplate: (name: string) => string;
  feeRange: [number, number];
  experienceRange: [number, number];
  slotDuration: number;
  roomPrefix: string;
}

const SPECIALTY_TEMPLATES: SpecialtyTemplate[] = [
  {
    specialty: "General Physician",
    count: 9,
    qualifications: [
      "MBBS, FCPS (Family Medicine)",
      "MBBS, MRCGP (UK)",
      "MBBS, MCPS (Family Medicine)",
      "MBBS, DGO, FCPS (Medicine)",
      "MBBS, FCPS (Internal Medicine)",
    ],
    bioTemplate: (name) =>
      `${name} is a trusted General Physician providing walk-in OPD consultations, adult health checkups, fever & infection management, and referrals for diagnostics. Ideal first point of contact for patients unsure which specialist to see.`,
    feeRange: [1500, 2500],
    experienceRange: [4, 20],
    slotDuration: 15,
    roomPrefix: "OPD",
  },
  {
    specialty: "Dental Surgery",
    count: 5,
    qualifications: [
      "BDS, RDS",
      "BDS, FCPS (Oral Surgery)",
      "BDS, MSc (Prosthodontics)",
      "BDS, Certified Implantologist",
      "BDS, MDS (Orthodontics)",
    ],
    bioTemplate: (name) =>
      `${name} provides comprehensive dental care including cleanings, fillings, root canal therapy, cosmetic dentistry, and dental implants using modern, minimally-invasive techniques.`,
    feeRange: [2000, 3500],
    experienceRange: [5, 18],
    slotDuration: 30,
    roomPrefix: "Dental Suite",
  },
  {
    specialty: "Dermatology & Aesthetics",
    count: 5,
    qualifications: [
      "MBBS, FCPS (Dermatology)",
      "MBBS, MCPS (Dermatology & Venereology)",
      "MBBS, Diploma in Cosmetic Dermatology",
      "MBBS, FCPS (Dermatology), Laser Certified",
    ],
    bioTemplate: (name) =>
      `${name} specializes in medical and cosmetic dermatology including acne treatment, laser therapy, anti-aging solutions, eczema and psoriasis management, and skin cancer screening.`,
    feeRange: [2500, 4000],
    experienceRange: [4, 16],
    slotDuration: 20,
    roomPrefix: "Aesthetic Suite",
  },
  {
    specialty: "Cardiology",
    count: 5,
    qualifications: [
      "MBBS, FCPS (Cardiology)",
      "MBBS, FCPS (Cardiology), Fellowship Interventional Cardiology",
      "MBBS, MD (Cardiology)",
      "MBBS, FRCP, FCPS (Cardiology)",
    ],
    bioTemplate: (name) =>
      `${name} is a consultant cardiologist offering ECG, echocardiography, hypertension management, cardiac risk assessment, and post-procedure cardiac care.`,
    feeRange: [3000, 5000],
    experienceRange: [7, 22],
    slotDuration: 20,
    roomPrefix: "Cardiology Clinic",
  },
  {
    specialty: "Pediatrics & Child Care",
    count: 5,
    qualifications: [
      "MBBS, FCPS (Pediatrics)",
      "MBBS, DCH, MCPS (Pediatrics)",
      "MBBS, FCPS (Pediatrics), Fellowship Neonatology",
    ],
    bioTemplate: (name) =>
      `${name} offers compassionate pediatric care including routine vaccinations, growth monitoring, newborn checkups, and management of common childhood illnesses.`,
    feeRange: [1800, 3000],
    experienceRange: [4, 18],
    slotDuration: 15,
    roomPrefix: "Pediatric Wing",
  },
  {
    specialty: "Ophthalmology / Eye Care",
    count: 4,
    qualifications: [
      "MBBS, FCPS (Ophthalmology)",
      "MBBS, DOMS, FCPS (Ophthalmology)",
      "MBBS, FCPS (Ophthalmology), Vitreo-Retinal Fellow",
    ],
    bioTemplate: (name) =>
      `${name} provides complete eye care services including vision testing, cataract evaluation, glaucoma screening, and management of diabetic retinopathy.`,
    feeRange: [2000, 3500],
    experienceRange: [5, 20],
    slotDuration: 20,
    roomPrefix: "Eye Care Suite",
  },
  {
    specialty: "Physiotherapy & Rehab",
    count: 4,
    qualifications: [
      "DPT (Doctor of Physical Therapy)",
      "DPT, MS-OMPT",
      "DPT, Certified Dry Needling & Sports Rehab",
    ],
    bioTemplate: (name) =>
      `${name} specializes in musculoskeletal rehabilitation, post-surgical mobility recovery, sports injury management, and chronic pain therapy.`,
    feeRange: [1800, 2800],
    experienceRange: [3, 15],
    slotDuration: 40,
    roomPrefix: "Rehab & Physio Lab",
  },
  {
    specialty: "General & Laparoscopic Surgery",
    count: 4,
    qualifications: [
      "MBBS, MS (General Surgery)",
      "MBBS, FCPS (Surgery)",
      "MBBS, MRCS, FCPS (Surgery)",
    ],
    bioTemplate: (name) =>
      `${name} performs minimally invasive laparoscopic procedures, hernia repair, gallbladder surgery, and general surgical OPD consultations.`,
    feeRange: [3000, 4500],
    experienceRange: [8, 22],
    slotDuration: 20,
    roomPrefix: "Surgical OPD",
  },
  {
    specialty: "Gynecology & Obstetrics",
    count: 6,
    qualifications: [
      "MBBS, FCPS (Gynecology & Obstetrics)",
      "MBBS, MRCOG (UK)",
      "MBBS, MCPS, FCPS (Gynae & Obs)",
    ],
    bioTemplate: (name) =>
      `${name} provides complete women's health services including antenatal care, high-risk pregnancy management, family planning, and gynecological screenings.`,
    feeRange: [2500, 4000],
    experienceRange: [5, 20],
    slotDuration: 20,
    roomPrefix: "Women's Health Suite",
  },
  {
    specialty: "Orthopedic Surgery",
    count: 6,
    qualifications: [
      "MBBS, FCPS (Orthopedic Surgery)",
      "MBBS, MS (Orthopedics)",
      "MBBS, FCPS (Ortho), Fellowship Joint Replacement",
    ],
    bioTemplate: (name) =>
      `${name} treats fractures, joint pain, sports injuries, and provides both surgical and non-surgical orthopedic care including joint replacement consultations.`,
    feeRange: [2800, 4500],
    experienceRange: [6, 21],
    slotDuration: 20,
    roomPrefix: "Orthopedic Clinic",
  },
  {
    specialty: "ENT (Ear, Nose & Throat)",
    count: 5,
    qualifications: [
      "MBBS, FCPS (ENT)",
      "MBBS, MS (ENT)",
      "MBBS, FCPS (Otorhinolaryngology)",
    ],
    bioTemplate: (name) =>
      `${name} diagnoses and treats ear infections, sinus problems, hearing loss, tonsillitis, and voice disorders using modern endoscopic techniques.`,
    feeRange: [2000, 3200],
    experienceRange: [4, 17],
    slotDuration: 20,
    roomPrefix: "ENT Clinic",
  },
  {
    specialty: "Neurology",
    count: 5,
    qualifications: [
      "MBBS, FCPS (Neurology)",
      "MBBS, MD (Neurology)",
      "MBBS, FCPS (Medicine), Fellowship Neurology",
    ],
    bioTemplate: (name) =>
      `${name} specializes in migraine and headache management, epilepsy, stroke follow-up care, and nerve-related disorders.`,
    feeRange: [3200, 5000],
    experienceRange: [7, 20],
    slotDuration: 25,
    roomPrefix: "Neurology Suite",
  },
  {
    specialty: "Psychiatry & Mental Health",
    count: 5,
    qualifications: [
      "MBBS, FCPS (Psychiatry)",
      "MBBS, MRCPsych (UK)",
      "MBBS, MCPS (Psychiatry)",
    ],
    bioTemplate: (name) =>
      `${name} provides confidential mental health consultations for anxiety, depression, stress management, and sleep disorders in a supportive environment.`,
    feeRange: [2500, 4000],
    experienceRange: [4, 16],
    slotDuration: 30,
    roomPrefix: "Wellness Suite",
  },
  {
    specialty: "Urology",
    count: 4,
    qualifications: [
      "MBBS, FCPS (Urology)",
      "MBBS, MS (Urology)",
    ],
    bioTemplate: (name) =>
      `${name} treats urinary tract conditions, kidney stones, prostate health, and provides minimally invasive urological procedures.`,
    feeRange: [3000, 4500],
    experienceRange: [6, 19],
    slotDuration: 20,
    roomPrefix: "Urology Clinic",
  },
  {
    specialty: "Endocrinology & Diabetes",
    count: 4,
    qualifications: [
      "MBBS, FCPS (Endocrinology)",
      "MBBS, MD (Endocrinology & Metabolism)",
    ],
    bioTemplate: (name) =>
      `${name} manages diabetes, thyroid disorders, hormonal imbalances, and metabolic conditions with individualized, evidence-based treatment plans.`,
    feeRange: [2800, 4200],
    experienceRange: [5, 18],
    slotDuration: 20,
    roomPrefix: "Endocrine Clinic",
  },
];

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function randInRange([min, max]: [number, number], seed: number): number {
  return min + (seed % (max - min + 1));
}

export async function expandDoctors() {
  const existingCountResult = await db.select({ count: sql<number>`count(*)` }).from(doctors);
  const existingCount = Number(existingCountResult[0]?.count || 0);

  if (existingCount >= 84) {
    console.log(`Doctors already expanded (${existingCount} present). Skipping.`);
    return;
  }

  const existingDoctors = await db.select({ name: doctors.name }).from(doctors);
  const usedNames = new Set(existingDoctors.map((d) => d.name));

  const newDoctors: (typeof doctors.$inferInsert)[] = [];
  let genderToggle = 0;
  let nameSeed = 0;

  for (const template of SPECIALTY_TEMPLATES) {
    for (let i = 0; i < template.count; i++) {
      let fullName = "";
      let attempts = 0;
      do {
        const isFemale = genderToggle % 2 === 0;
        const firstPool = isFemale ? FEMALE_FIRST : MALE_FIRST;
        const first = firstPool[(nameSeed + attempts) % firstPool.length];
        const last = LAST_NAMES[(nameSeed * 3 + attempts * 7) % LAST_NAMES.length];
        fullName = `Dr. ${first} ${last}`;
        attempts++;
        genderToggle++;
      } while (usedNames.has(fullName) && attempts < 50);

      usedNames.add(fullName);
      nameSeed++;

      const seed = nameSeed * 13 + template.specialty.length;
      const fee = randInRange(template.feeRange, seed);
      const experience = randInRange(template.experienceRange, seed + 5);
      const rating = (4.5 + ((seed % 6) * 0.1)).toFixed(1);
      const reviewsCount = 20 + (seed % 130);
      const shift = pick(SHIFTS, seed);
      const days = pick(DAY_PATTERNS, seed + 2);
      const roomNumber = pick(OPD_ROOMS, seed + 4);

      newDoctors.push({
        name: fullName,
        title: "Dr.",
        qualification: pick(template.qualifications, seed),
        specialty: template.specialty,
        experienceYears: experience,
        fee,
        rating,
        reviewsCount,
        roomNo: `${template.roomPrefix} ${roomNumber.split(" ")[1]}`,
        bio: template.bioTemplate(fullName),
        availableDays: days,
        shiftStart: shift.start,
        shiftEnd: shift.end,
        slotDurationMinutes: template.slotDuration,
        active: true,
        featured: false,
      });
    }
  }

  await db.insert(doctors).values(newDoctors);
  console.log(`Inserted ${newDoctors.length} new doctors. Total should now be ${existingCount + newDoctors.length}.`);

  // Also ensure services exist for the newly introduced specialties
  const existingServicesResult = await db.select({ category: services.category }).from(services);
  const existingCategories = new Set(existingServicesResult.map((s) => s.category));

  const newServices: (typeof services.$inferInsert)[] = [];

  if (!existingCategories.has("Gynecology")) {
    newServices.push(
      {
        name: "Antenatal Checkup & Ultrasound",
        category: "Gynecology",
        description: "Comprehensive pregnancy monitoring including growth scans, maternal vitals, and risk screening for expecting mothers.",
        durationMinutes: 30,
        price: 3000,
        icon: "Flower2",
        badge: "Popular",
        active: true,
        featured: true,
      },
      {
        name: "Gynecological Consultation",
        category: "Gynecology",
        description: "Confidential consultation for menstrual disorders, family planning, PCOS management, and general women's health.",
        durationMinutes: 25,
        price: 2800,
        icon: "Flower2",
        active: true,
        featured: false,
      }
    );
  }

  if (!existingCategories.has("Orthopedics")) {
    newServices.push({
      name: "Joint & Fracture Consultation",
      category: "Orthopedics",
      description: "Evaluation of joint pain, sports injuries, and fractures with digital X-ray referral and personalized treatment plans.",
      durationMinutes: 25,
      price: 3200,
      icon: "Bone",
      badge: "Same Day",
      active: true,
      featured: true,
    });
  }

  if (!existingCategories.has("ENT")) {
    newServices.push({
      name: "ENT Consultation & Endoscopy",
      category: "ENT",
      description: "Diagnosis and treatment of ear infections, sinus issues, hearing concerns, and throat conditions with endoscopic evaluation.",
      durationMinutes: 25,
      price: 2500,
      icon: "Ear",
      active: true,
      featured: false,
    });
  }

  if (!existingCategories.has("Neurology")) {
    newServices.push({
      name: "Neurology Consultation",
      category: "Neurology",
      description: "Specialist evaluation for migraines, seizures, nerve pain, and post-stroke follow-up care.",
      durationMinutes: 30,
      price: 4000,
      icon: "Brain",
      active: true,
      featured: false,
    });
  }

  if (!existingCategories.has("Psychiatry")) {
    newServices.push({
      name: "Mental Health Counseling",
      category: "Psychiatry",
      description: "Confidential sessions for anxiety, depression, stress, and sleep disorders in a judgment-free, supportive setting.",
      durationMinutes: 40,
      price: 3200,
      icon: "Brain",
      badge: "Confidential",
      active: true,
      featured: true,
    });
  }

  if (!existingCategories.has("Urology")) {
    newServices.push({
      name: "Urology Consultation",
      category: "Urology",
      description: "Assessment and management of urinary tract conditions, kidney stones, and prostate health concerns.",
      durationMinutes: 25,
      price: 3500,
      icon: "Droplet",
      active: true,
      featured: false,
    });
  }

  if (!existingCategories.has("Endocrinology")) {
    newServices.push({
      name: "Diabetes & Thyroid Management",
      category: "Endocrinology",
      description: "Personalized diabetes control plans, thyroid function assessment, and hormonal imbalance treatment.",
      durationMinutes: 25,
      price: 3000,
      icon: "Syringe",
      badge: "Chronic Care",
      active: true,
      featured: true,
    });
  }

  if (newServices.length > 0) {
    await db.insert(services).values(newServices);
    console.log(`Inserted ${newServices.length} new services for expanded specialties.`);
  }
}


