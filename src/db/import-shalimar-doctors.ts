import { db } from "./index";
import { doctors, appointments, patients } from "./schema";
import { sql, eq } from "drizzle-orm";
import fs from "fs";

// Helper to parse fee like "Rs. 2,500" -> 2500
function parseFee(feeStr: string): number {
  if (!feeStr) return 2500;
  const cleaned = feeStr.replace(/[^0-9]/g, "");
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 2500 : num;
}

function parseExperience(exprStr: string): number {
  if (!exprStr) return 5;
  const match = exprStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 5;
}

function convertDays(availDays: string): string {
  if (!availDays) return "Mon,Tue,Wed,Thu,Fri";
  const map: Record<string, string> = {
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
    Saturday: "Sat",
    Sunday: "Sun",
  };
  const days = availDays.split(",").map((d) => d.trim()).filter(Boolean);
  const converted = days.map((d) => map[d] || d.slice(0, 3));
  return converted.join(",");
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
    .replace(/\bDr\b/g, "Dr.")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSpecialty(spec: string): string {
  const s = spec.toLowerCase();
  if (s.includes("gynaecologist") || s.includes("gynecology") || s.includes("gynae") || s.includes("infertility") || s.includes("maternal") || s.includes("reproductive") || s.includes("uro-gynaecologist")) {
    // Keep original detailed but map to Gynecology & Obstetrics for grouping
    if (s.includes("oncologist")) return "Gynae-Oncology";
    if (s.includes("infertility")) return "Infertility Specialist";
    if (s.includes("maternal")) return "Maternal Fetal Medicine";
    if (s.includes("reproductive")) return "Reproductive Endocrinology";
    if (s.includes("uro-gynaecologist")) return "Uro-Gynaecology";
    return "Gynecology & Obstetrics";
  }
  if (s.includes("physician") && s.includes("gastro")) return "Gastroenterology";
  if (s.includes("gastroenterologist")) return "Gastroenterology";
  if (s.includes("breast")) return "Breast Surgery";
  if (s.includes("neurologist") && !s.includes("neuro surgeon")) return "Neurology";
  if (s.includes("osteoporosis")) return "Osteoporosis & Bone Health";
  if (s.includes("endocrinologist")) return "Endocrinology & Diabetes";
  if (s.includes("ophthalmologist") || s.includes("eye")) return "Ophthalmology / Eye Care";
  if (s.includes("orthopaedic") || s.includes("orthopedic")) return "Orthopedic Surgery";
  if (s.includes("cardiologist") || s.includes("cardiology")) return "Cardiology";
  if (s.includes("dermatologist") || s.includes("skin")) return "Dermatology & Aesthetics";
  if (s.includes("urologist")) return "Urology";
  if (s.includes("bariatric")) return "Bariatric Surgery";
  if (s.includes("paediatrician") || s.includes("pediatric")) return "Pediatrics & Child Care";
  if (s.includes("rheumatologist")) return "Rheumatology";
  if (s.includes("nephrologist")) return "Nephrology";
  if (s.includes("oncologist") && !s.includes("gynae")) return "Oncology";
  if (s.includes("physician") && !s.includes("gastro")) return "General Physician";
  if (s.includes("plastic")) return "Plastic Surgery";
  if (s.includes("ent")) return "ENT (Ear, Nose & Throat)";
  if (s.includes("psychiatrist") || s.includes("psychiatry")) return "Psychiatry & Mental Health";
  if (s.includes("nutritionist") || s.includes("diet")) return "Nutrition & Dietetics";
  if (s.includes("pulmonologist") || s.includes("chest")) return "Pulmonology";
  if (s.includes("haematologist") || s.includes("hematologist")) return "Haematology";
  if (s.includes("neuro surgeon")) return "Neurosurgery";
  if (s.includes("surgeon") && !s.includes("orthopaedic") && !s.includes("breast") && !s.includes("bariatric") && !s.includes("plastic") && !s.includes("neuro")) return "General & Laparoscopic Surgery";
  return spec.split(",")[0].trim() || "General Physician";
}

export async function importShalimarDoctors() {
  const rawPath = "/tmp/shalimar_doctors.json";
  if (!fs.existsSync(rawPath)) {
    console.error("Shalimar doctors JSON not found at", rawPath);
    return;
  }

  const rawDoctors = JSON.parse(fs.readFileSync(rawPath, "utf-8"));

  console.log(`Found ${rawDoctors.length} Shalimar doctors to import`);

  // Clear existing doctors
  console.log("Clearing existing doctors...");
  await db.execute(sql`TRUNCATE TABLE doctors RESTART IDENTITY CASCADE`);

  // Also clear appointments that reference doctors
  await db.execute(sql`TRUNCATE TABLE appointments RESTART IDENTITY CASCADE`);

  const doctorsToInsert: (typeof doctors.$inferInsert)[] = [];

  for (const doc of rawDoctors) {
    const fullNameRaw = doc.FullName?.trim() || "Unknown Doctor";
    // Convert PROF. DR. HAROON YOUSAF -> Dr. Haroon Yousaf
    let name = fullNameRaw
      .replace(/^(PROF\.?\s*)?(DR\.?\s*)+/i, "Dr. ")
      .replace(/\s+/g, " ")
      .trim();
    name = toTitleCase(name);
    // Ensure Dr. prefix
    if (!name.toLowerCase().startsWith("dr.")) {
      name = `Dr. ${name}`;
    }

    const specialty = normalizeSpecialty(doc.Specilality || doc.DeptName || "General Physician");
    const qualification = doc.Edu?.trim() || doc.Title?.trim() || "MBBS, FCPS";
    const experience = parseExperience(doc.Expr);
    const feeStr = doc.ConsultFee || doc.PvtVisitFee || doc.EveningFee || "Rs. 2,500";
    const fee = parseFee(feeStr);
    const availableDays = convertDays(doc.AvailbaleDays);
    const avatarUrl = doc.PicPath?.trim() || null;
    const bio = `${name} is a ${doc.Title || specialty} at Shalamar Hospital Lahore with ${experience}+ years of clinical experience. Specialized in ${specialty} with expertise in ${qualification}. ${doc.DeptName ? `Department: ${doc.DeptName}.` : ""} Available on ${doc.AvailbaleDays || "Weekdays"}. Consultation fee PKR ${fee.toLocaleString()}.`;

    doctorsToInsert.push({
      name,
      title: "Dr.",
      qualification: qualification.slice(0, 255),
      specialty,
      experienceYears: experience,
      fee,
      rating: (4.6 + Math.random() * 0.4).toFixed(1),
      reviewsCount: 15 + Math.floor(Math.random() * 120),
      roomNo: `OPD-${doc.DeptCode}-${doc.ID}`,
      avatarUrl,
      bio: bio.slice(0, 1000),
      availableDays,
      shiftStart: "09:00 AM",
      shiftEnd: "04:00 PM",
      slotDurationMinutes: 20,
      active: true,
      featured: experience > 15,
    });
  }

  // Add some General Physician OPD doctors if not enough
  const opdCount = doctorsToInsert.filter((d) => d.specialty === "General Physician").length;
  if (opdCount < 10) {
    const needed = 10 - opdCount;
    for (let i = 0; i < needed; i++) {
      doctorsToInsert.push({
        name: `Dr. OPD Consultant ${i + 1}`,
        title: "Dr.",
        qualification: "MBBS, FCPS (Family Medicine)",
        specialty: "General Physician",
        experienceYears: 5 + i,
        fee: 1500 + i * 100,
        rating: "4.8",
        reviewsCount: 30 + i * 5,
        roomNo: `OPD-GP-${101 + i}`,
        avatarUrl: null,
        bio: `General Physician providing walk-in OPD consultations for routine checkups, fever, flu and referrals. Ideal first point of contact for patients unsure which specialist to see.`,
        availableDays: "Mon,Tue,Wed,Thu,Fri,Sat",
        shiftStart: "08:00 AM",
        shiftEnd: "08:00 PM",
        slotDurationMinutes: 15,
        active: true,
        featured: i === 0,
      });
    }
  }

  console.log(`Inserting ${doctorsToInsert.length} doctors...`);
  const inserted = await db.insert(doctors).values(doctorsToInsert).returning({ id: doctors.id });
  console.log(`Inserted ${inserted.length} doctors`);

  // Re-seed appointments with new doctors
  console.log("Re-seeding appointments...");
  const allPatients = await db.select({ id: patients.id }).from(patients);
  if (allPatients.length === 0) {
    console.log("No patients found, skipping appointment seeding");
    return;
  }

  const { appointments: appointmentsTable } = await import("./schema");
  const appointmentsToInsert = [];
  const statuses = ["Pending", "Pending", "Completed"];
  const today = new Date();
  
  for (let i = 0; i < 50; i++) {
    const randomPatient = allPatients[Math.floor(Math.random() * allPatients.length)];
    const randomDoctor = inserted[Math.floor(Math.random() * inserted.length)];
    const randomDaysOffset = Math.floor(Math.random() * 14) - 7; // -7 to +7 days
    const appointmentDate = new Date(today);
    appointmentDate.setDate(today.getDate() + randomDaysOffset);
    const dateStr = appointmentDate.toISOString().split("T")[0];
    const hours = 9 + Math.floor(Math.random() * 8);
    const minutes = Math.random() > 0.5 ? "00" : "30";
    const ampm = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    const timeStr = `${String(hour12).padStart(2, "0")}:${minutes} ${ampm}`;
    
    appointmentsToInsert.push({
      appointmentNumber: `MED-${new Date().getFullYear()}-${String(1000 + i).padStart(4, "0")}`,
      patientId: randomPatient.id,
      patientName: `Patient ${i + 1}`,
      patientPhone: `0300${String(1000000 + i).padStart(7, "0")}`,
      doctorId: randomDoctor.id,
      appointmentDate: dateStr,
      appointmentTime: timeStr,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      fee: 1500 + Math.floor(Math.random() * 3000),
      visitType: Math.random() > 0.5 ? "New Consultation" : "Follow-up",
    });
  }

  await db.insert(appointmentsTable).values(appointmentsToInsert);
  console.log(`Inserted ${appointmentsToInsert.length} appointments`);
}

if (require.main === module) {
  import("dotenv").then(({ default: dotenv }) => {
    dotenv.config();
    importShalimarDoctors()
      .then(() => {
        console.log("Shalimar import complete!");
        process.exit(0);
      })
      .catch((err) => {
        console.error("Import failed:", err);
        process.exit(1);
      });
  });
}
