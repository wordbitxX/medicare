import { pool } from "./index";

/**
 * Idempotent DDL for the entire application schema.
 * Safe to run on every server start (CREATE TABLE IF NOT EXISTS /
 * ADD COLUMN IF NOT EXISTS), so a brand-new Supabase/Postgres database
 * becomes fully usable without a manual migration step.
 */
const STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS clinic_settings (
    id SERIAL PRIMARY KEY,
    clinic_name VARCHAR(255) NOT NULL DEFAULT 'Medicare Plus',
    tagline VARCHAR(255) NOT NULL DEFAULT 'Excellence in Healthcare & Specialized Patient Care',
    clinic_type VARCHAR(100) NOT NULL DEFAULT 'Multi-Specialty',
    phone VARCHAR(50) NOT NULL DEFAULT '+92 325 1888841',
    emergency_phone VARCHAR(50) NOT NULL DEFAULT '+92 325 1888841',
    whatsapp VARCHAR(50) NOT NULL DEFAULT '923251888841',
    email VARCHAR(100) NOT NULL DEFAULT 'info@wordbitx.com',
    address TEXT NOT NULL DEFAULT 'WordbitX Specialty Care Center, Main Boulevard, Gulberg III, Lahore, Pakistan',
    city VARCHAR(100) NOT NULL DEFAULT 'Lahore, Pakistan',
    opening_hours_weekday VARCHAR(100) NOT NULL DEFAULT 'Mon - Fri: 8:00 AM - 10:00 PM',
    opening_hours_saturday VARCHAR(100) NOT NULL DEFAULT 'Saturday: 9:00 AM - 8:00 PM',
    opening_hours_sunday VARCHAR(100) NOT NULL DEFAULT 'Sunday: 10:00 AM - 4:00 PM (Emergency 24/7)',
    currency VARCHAR(10) NOT NULL DEFAULT 'PKR',
    primary_color VARCHAR(50) NOT NULL DEFAULT '#0f2b48',
    secondary_color VARCHAR(50) NOT NULL DEFAULT '#0d9488',
    hero_headline TEXT NOT NULL DEFAULT 'Advanced Healthcare for You & Your Family',
    hero_subheadline TEXT NOT NULL DEFAULT 'Board-certified specialist doctors, modern diagnostic facilities, and same-day confirmed appointments.',
    about_text TEXT NOT NULL DEFAULT 'A premier healthcare institution providing comprehensive medical, surgical, dental, and diagnostic services with world-class clinical standards.',
    updated_at TIMESTAMP DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'receptionist',
    phone VARCHAR(50),
    avatar_url TEXT,
    doctor_id INTEGER,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    title VARCHAR(50) NOT NULL DEFAULT 'Dr.',
    qualification VARCHAR(255) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    experience_years INTEGER NOT NULL DEFAULT 8,
    fee INTEGER NOT NULL DEFAULT 2500,
    rating VARCHAR(10) NOT NULL DEFAULT '4.9',
    reviews_count INTEGER NOT NULL DEFAULT 45,
    room_no VARCHAR(50) NOT NULL DEFAULT 'Consultation Room 101',
    avatar_url TEXT,
    bio TEXT NOT NULL DEFAULT '',
    available_days TEXT NOT NULL DEFAULT 'Mon,Tue,Wed,Thu,Fri',
    shift_start VARCHAR(20) NOT NULL DEFAULT '09:00 AM',
    shift_end VARCHAR(20) NOT NULL DEFAULT '05:00 PM',
    slot_duration_minutes INTEGER NOT NULL DEFAULT 20,
    active BOOLEAN NOT NULL DEFAULT true,
    featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    price INTEGER NOT NULL DEFAULT 2500,
    icon VARCHAR(50) NOT NULL DEFAULT 'Stethoscope',
    badge VARCHAR(50),
    preparation_instructions TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    mrn VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    cnic VARCHAR(30) UNIQUE,
    email VARCHAR(150),
    gender VARCHAR(20) NOT NULL DEFAULT 'Male',
    age INTEGER NOT NULL DEFAULT 30,
    blood_group VARCHAR(10),
    address TEXT,
    city VARCHAR(100) DEFAULT 'Lahore',
    emergency_contact VARCHAR(100),
    allergies TEXT,
    medical_history TEXT,
    total_visits INTEGER NOT NULL DEFAULT 1,
    outstanding_balance INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    appointment_number VARCHAR(50) NOT NULL UNIQUE,
    patient_id INTEGER,
    patient_name VARCHAR(150) NOT NULL,
    patient_phone VARCHAR(50) NOT NULL,
    patient_cnic VARCHAR(30),
    patient_email VARCHAR(150),
    patient_gender VARCHAR(20) DEFAULT 'Male',
    patient_age INTEGER DEFAULT 30,
    doctor_id INTEGER NOT NULL,
    service_id INTEGER,
    appointment_date VARCHAR(50) NOT NULL,
    appointment_time VARCHAR(50) NOT NULL,
    visit_type VARCHAR(50) NOT NULL DEFAULT 'New Consultation',
    status VARCHAR(50) NOT NULL DEFAULT 'Confirmed',
    fee INTEGER NOT NULL DEFAULT 2500,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    patient_notes TEXT,
    doctor_notes TEXT,
    prescription TEXT,
    created_at TIMESTAMP DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(150),
    service_interested VARCHAR(150),
    source VARCHAR(50) NOT NULL DEFAULT 'Website Form',
    status VARCHAR(50) NOT NULL DEFAULT 'New',
    notes TEXT,
    created_at TIMESTAMP DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    patient_name VARCHAR(150) NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5,
    treatment VARCHAR(150) NOT NULL,
    doctor_name VARCHAR(150),
    comment TEXT NOT NULL,
    city VARCHAR(100) DEFAULT 'Lahore',
    published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS blog_posts (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(200) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    author_name VARCHAR(150) NOT NULL DEFAULT 'Dr. Ayesha Siddiqui',
    author_role VARCHAR(150) DEFAULT 'Consultant Physician',
    read_time VARCHAR(50) NOT NULL DEFAULT '5 min read',
    summary TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    cover_image TEXT,
    published BOOLEAN NOT NULL DEFAULT true,
    views INTEGER NOT NULL DEFAULT 120,
    created_at TIMESTAMP DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS faqs (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    order_number INTEGER NOT NULL DEFAULT 1,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS patient_accounts (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER UNIQUE,
    phone VARCHAR(30) NOT NULL UNIQUE,
    cnic VARCHAR(30) UNIQUE,
    email VARCHAR(150) UNIQUE,
    password_hash TEXT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    gender VARCHAR(20) NOT NULL DEFAULT 'Male',
    date_of_birth VARCHAR(20),
    blood_group VARCHAR(10),
    city VARCHAR(100) NOT NULL DEFAULT 'Lahore',
    address TEXT,
    emergency_contact VARCHAR(60),
    allergies TEXT,
    verified BOOLEAN NOT NULL DEFAULT false,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS otp_codes (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(30) NOT NULL,
    code VARCHAR(8) NOT NULL,
    purpose VARCHAR(30) NOT NULL DEFAULT 'signup',
    used BOOLEAN NOT NULL DEFAULT false,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT now()
  )`,
  // ── Idempotent column back-fills for databases created from an older schema ──
  `ALTER TABLE patients ADD COLUMN IF NOT EXISTS cnic VARCHAR(30)`,
  `ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_cnic VARCHAR(30)`,
  `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS cover_image TEXT`,
  // ── Indexes used by hot queries ──
  `CREATE INDEX IF NOT EXISTS otp_phone_idx ON otp_codes (phone, purpose, used)`,
  `CREATE INDEX IF NOT EXISTS appointments_date_idx ON appointments (appointment_date)`,
  `CREATE INDEX IF NOT EXISTS appointments_doctor_idx ON appointments (doctor_id)`,
  `CREATE INDEX IF NOT EXISTS patients_phone_idx ON patients (phone)`,
  `CREATE INDEX IF NOT EXISTS blog_posts_published_idx ON blog_posts (published)`,
];

export async function ensureSchema(): Promise<void> {
  for (const statement of STATEMENTS) {
    await pool.query(statement);
  }
}
