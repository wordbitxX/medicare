import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  varchar,
  index,
} from "drizzle-orm/pg-core";

// Clinic settings table for single/multi-clinic customizer
export const clinicSettings = pgTable("clinic_settings", {
  id: serial("id").primaryKey(),
  clinicName: varchar("clinic_name", { length: 255 }).notNull().default("Medicare Plus"),
  tagline: varchar("tagline", { length: 255 }).notNull().default("WordbitX Specialty Care"),
  clinicType: varchar("clinic_type", { length: 100 }).notNull().default("Multi-Specialty"), // Dental, Skin, Eye, Physio, Pediatric, Multi-Specialty
  phone: varchar("phone", { length: 50 }).notNull().default("+92 325 1888841"),
  emergencyPhone: varchar("emergency_phone", { length: 50 }).notNull().default("+92 325 1888841"),
  whatsapp: varchar("whatsapp", { length: 50 }).notNull().default("923251888841"),
  email: varchar("email", { length: 100 }).notNull().default("info@wordbitx.com"),
  address: text("address").notNull().default("WordbitX Specialty Care Center, Main Boulevard, Gulberg III, Lahore, Pakistan"),
  city: varchar("city", { length: 100 }).notNull().default("Lahore, Pakistan"),
  openingHoursWeekday: varchar("opening_hours_weekday", { length: 100 }).notNull().default("Mon - Fri: 8:00 AM - 10:00 PM"),
  openingHoursSaturday: varchar("opening_hours_saturday", { length: 100 }).notNull().default("Saturday: 9:00 AM - 8:00 PM"),
  openingHoursSunday: varchar("opening_hours_sunday", { length: 100 }).notNull().default("Sunday: 10:00 AM - 4:00 PM (Emergency 24/7)"),
  currency: varchar("currency", { length: 10 }).notNull().default("PKR"),
  primaryColor: varchar("primary_color", { length: 50 }).notNull().default("#0f2b48"),
  secondaryColor: varchar("secondary_color", { length: 50 }).notNull().default("#0d9488"),
  heroHeadline: text("hero_headline").notNull().default("Advanced Healthcare for You & Your Family"),
  heroSubheadline: text("hero_subheadline").notNull().default("Board-certified specialist doctors, modern diagnostic facilities, and same-day confirmed appointments in Lahore."),
  aboutText: text("about_text").notNull().default("Medicare Plus is a premier healthcare institution providing comprehensive medical, surgical, dental, and diagnostic services in Pakistan with world-class clinical standards."),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Staff / Users (Super Admin, Receptionist, Doctor)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  password: text("password").notNull(), // hashed or demo check
  role: varchar("role", { length: 50 }).notNull().default("receptionist"), // super_admin, receptionist, doctor
  phone: varchar("phone", { length: 50 }),
  avatarUrl: text("avatar_url"),
  doctorId: integer("doctor_id"), // links to doctors table if role == doctor
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Doctors
export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  title: varchar("title", { length: 50 }).notNull().default("Dr."),
  qualification: varchar("qualification", { length: 255 }).notNull(), // MBBS, FCPS, etc.
  specialty: varchar("specialty", { length: 100 }).notNull(), // Cardiology, Dermatology, etc.
  experienceYears: integer("experience_years").notNull().default(8),
  fee: integer("fee").notNull().default(2500), // PKR
  rating: varchar("rating", { length: 10 }).notNull().default("4.9"),
  reviewsCount: integer("reviews_count").notNull().default(45),
  roomNo: varchar("room_no", { length: 50 }).notNull().default("Consultation Room 101"),
  avatarUrl: text("avatar_url"),
  bio: text("bio").notNull(),
  availableDays: text("available_days").notNull().default("Mon,Tue,Wed,Thu,Fri"), // comma-separated
  shiftStart: varchar("shift_start", { length: 20 }).notNull().default("09:00 AM"),
  shiftEnd: varchar("shift_end", { length: 20 }).notNull().default("05:00 PM"),
  slotDurationMinutes: integer("slot_duration_minutes").notNull().default(20),
  active: boolean("active").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  activeFeaturedIdx: index("doctors_active_featured_idx").on(table.active, table.featured),
}));

// Services
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // Dental, Skin, Cardiology, Pediatrics, etc.
  description: text("description").notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(30),
  price: integer("price").notNull().default(2500), // PKR
  icon: varchar("icon", { length: 50 }).notNull().default("Stethoscope"),
  badge: varchar("badge", { length: 50 }), // e.g. "Popular", "Same Day", "Advanced"
  preparationInstructions: text("preparation_instructions"),
  active: boolean("active").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  activeFeaturedIdx: index("services_active_featured_idx").on(table.active, table.featured),
  categoryIdx: index("services_category_idx").on(table.category),
}));

// Patients CRM
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  mrn: varchar("mrn", { length: 50 }).notNull().unique(), // Medical Record Number e.g. "MRN-2026-101"
  name: varchar("name", { length: 150 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  cnic: varchar("cnic", { length: 30 }).unique(),
  email: varchar("email", { length: 150 }),
  gender: varchar("gender", { length: 20 }).notNull().default("Male"), // Male, Female, Other
  age: integer("age").notNull().default(30),
  bloodGroup: varchar("blood_group", { length: 10 }), // O+, A+, B+, AB+, etc.
  address: text("address"),
  city: varchar("city", { length: 100 }).default("Lahore"),
  emergencyContact: varchar("emergency_contact", { length: 100 }),
  allergies: text("allergies"),
  medicalHistory: text("medical_history"),
  totalVisits: integer("total_visits").notNull().default(1),
  outstandingBalance: integer("outstanding_balance").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  phoneIdx: index("patients_phone_idx").on(table.phone),
}));

// Appointments
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  appointmentNumber: varchar("appointment_number", { length: 50 }).notNull().unique(), // e.g. MED-2026-1001
  patientId: integer("patient_id"),
  patientName: varchar("patient_name", { length: 150 }).notNull(),
  patientPhone: varchar("patient_phone", { length: 50 }).notNull(),
  patientCnic: varchar("patient_cnic", { length: 30 }),
  patientEmail: varchar("patient_email", { length: 150 }),
  patientGender: varchar("patient_gender", { length: 20 }).default("Male"),
  patientAge: integer("patient_age").default(30),
  doctorId: integer("doctor_id").notNull(),
  serviceId: integer("service_id"),
  appointmentDate: varchar("appointment_date", { length: 50 }).notNull(), // YYYY-MM-DD
  appointmentTime: varchar("appointment_time", { length: 50 }).notNull(), // e.g. 10:20 AM
  visitType: varchar("visit_type", { length: 50 }).notNull().default("New Consultation"), // New Consultation, Follow-up, Routine Checkup, Procedure
  status: varchar("status", { length: 50 }).notNull().default("Confirmed"), // Confirmed, Pending, In Consultation, Completed, Cancelled, No-Show
  fee: integer("fee").notNull().default(2500), // PKR
  paymentStatus: varchar("payment_status", { length: 50 }).notNull().default("Pending"), // Paid, Pending, Refunded
  patientNotes: text("patient_notes"),
  doctorNotes: text("doctor_notes"),
  prescription: text("prescription"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  doctorDateTimeIdx: index("appointments_doctor_date_time_idx").on(table.doctorId, table.appointmentDate, table.appointmentTime),
  doctorDateStatusIdx: index("appointments_doctor_date_status_idx").on(table.doctorId, table.appointmentDate, table.status),
  dateIdx: index("appointments_date_idx").on(table.appointmentDate),
}));

// Leads / Inquiries CRM
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  email: varchar("email", { length: 150 }),
  serviceInterested: varchar("service_interested", { length: 150 }),
  source: varchar("source", { length: 50 }).notNull().default("Website Form"), // Website Form, WhatsApp Click, Phone Call, Walk-in
  status: varchar("status", { length: 50 }).notNull().default("New"), // New, Contacted, Converted, Dropped
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reviews
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  patientName: varchar("patient_name", { length: 150 }).notNull(),
  rating: integer("rating").notNull().default(5),
  treatment: varchar("treatment", { length: 150 }).notNull(),
  doctorName: varchar("doctor_name", { length: 150 }),
  comment: text("comment").notNull(),
  city: varchar("city", { length: 100 }).default("Lahore"),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  publishedIdx: index("reviews_published_idx").on(table.published, table.id),
}));

// Blog Posts
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  authorName: varchar("author_name", { length: 150 }).notNull().default("Dr. Ayesha Siddiqui"),
  authorRole: varchar("author_role", { length: 150 }).default("Consultant Physician"),
  readTime: varchar("read_time", { length: 50 }).notNull().default("5 min read"),
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  coverImage: text("cover_image"),
  published: boolean("published").notNull().default(true),
  views: integer("views").notNull().default(120),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  publishedIdx: index("blog_published_idx").on(table.published, table.id),
  categoryIdx: index("blog_category_idx").on(table.category),
}));

// Patient Portal Accounts (separate from staff users)
export const patientAccounts = pgTable("patient_accounts", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").unique(), // links to patients table
  phone: varchar("phone", { length: 30 }).notNull().unique(),
  cnic: varchar("cnic", { length: 30 }).unique(),
  email: varchar("email", { length: 150 }).unique(),
  passwordHash: text("password_hash"),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  gender: varchar("gender", { length: 20 }).notNull().default("Male"),
  dateOfBirth: varchar("date_of_birth", { length: 20 }),
  bloodGroup: varchar("blood_group", { length: 10 }),
  city: varchar("city", { length: 100 }).notNull().default("Lahore"),
  address: text("address"),
  emergencyContact: varchar("emergency_contact", { length: 60 }),
  allergies: text("allergies"),
  verified: boolean("verified").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// OTP codes for phone verification
export const otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  phone: varchar("phone", { length: 30 }).notNull(),
  code: varchar("code", { length: 8 }).notNull(),
  purpose: varchar("purpose", { length: 30 }).notNull().default("signup"), // signup | login
  used: boolean("used").notNull().default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// FAQs
export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 100 }).notNull().default("General"), // Appointments, Pricing, Insurance, Emergency, Services
  orderNumber: integer("order_number").notNull().default(1),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});
