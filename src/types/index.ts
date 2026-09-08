export interface ClinicSettingsType {
  id: number;
  clinicName: string;
  tagline: string;
  clinicType: string;
  phone: string;
  emergencyPhone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  openingHoursWeekday: string;
  openingHoursSaturday: string;
  openingHoursSunday: string;
  currency: string;
  primaryColor: string;
  secondaryColor: string;
  heroHeadline: string;
  heroSubheadline: string;
  aboutText: string;
  updatedAt?: Date | null;
}

export interface DoctorType {
  id: number;
  name: string;
  title: string;
  qualification: string;
  specialty: string;
  experienceYears: number;
  fee: number;
  rating: string;
  reviewsCount: number;
  roomNo: string;
  avatarUrl: string | null;
  bio: string;
  availableDays: string;
  shiftStart: string;
  shiftEnd: string;
  slotDurationMinutes: number;
  active: boolean;
  featured: boolean;
  createdAt?: Date | null;
}

export interface ServiceType {
  id: number;
  name: string;
  category: string;
  description: string;
  durationMinutes: number;
  price: number;
  icon: string;
  badge: string | null;
  preparationInstructions: string | null;
  active: boolean;
  featured: boolean;
  createdAt?: Date | null;
}

export interface PatientType {
  id: number;
  mrn: string;
  name: string;
  phone: string;
  cnic?: string | null;
  email: string | null;
  gender: string;
  age: number;
  bloodGroup: string | null;
  address: string | null;
  city: string | null;
  emergencyContact: string | null;
  allergies: string | null;
  medicalHistory: string | null;
  totalVisits: number;
  outstandingBalance: number;
  createdAt?: Date | null;
}

export interface AppointmentType {
  id: number;
  appointmentNumber: string;
  patientId?: number | null;
  patientName: string;
  patientPhone: string;
  patientCnic?: string | null;
  patientEmail?: string | null;
  patientGender?: string | null;
  patientAge?: number | null;
  doctorId: number;
  doctorName?: string | null;
  doctorSpecialty?: string | null;
  doctorRoom?: string | null;
  serviceId?: number | null;
  serviceName?: string | null;
  appointmentDate: string;
  appointmentTime: string;
  visitType: string;
  status: string; // Confirmed, Pending, In Consultation, Completed, Cancelled
  fee: number;
  paymentStatus: string;
  patientNotes?: string | null;
  doctorNotes?: string | null;
  prescription?: string | null;
  createdAt?: Date | null;
}

export interface LeadType {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  serviceInterested?: string | null;
  source: string;
  status: string; // New, Contacted, Converted, Dropped
  notes?: string | null;
  createdAt?: Date | null;
}

export interface ReviewType {
  id: number;
  patientName: string;
  rating: number;
  treatment: string;
  doctorName?: string | null;
  comment: string;
  city?: string | null;
  published: boolean;
  createdAt?: Date | null;
}

export interface BlogPostType {
  id: number;
  slug: string;
  title: string;
  category: string;
  authorName: string;
  authorRole: string | null;
  readTime: string;
  summary: string;
  content: string;
  coverImage?: string | null;
  published: boolean;
  views: number;
  createdAt?: Date | null;
}

export interface FaqType {
  id: number;
  question: string;
  answer: string;
  category: string;
  orderNumber: number;
  active: boolean;
  createdAt?: Date | null;
}

export interface StaffUserType {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: "super_admin" | "receptionist" | "doctor";
  phone?: string | null;
  avatarUrl?: string | null;
  doctorId?: number | null;
  doctorName?: string | null;
  active: boolean;
  createdAt?: Date | null;
}
