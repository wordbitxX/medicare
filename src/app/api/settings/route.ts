import { NextResponse } from "next/server";
import { db } from "@/db";
import { clinicSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { publicCacheHeaders } from "@/lib/cache";



export async function GET() {
  try {
    const settings = await db.select().from(clinicSettings).limit(1);
    if (settings.length === 0) {
      return NextResponse.json({
        clinicName: "Medicare Plus",
        tagline: "WordbitX Specialty Care",
        clinicType: "Multi-Specialty",
        phone: "+92 325 1888841",
        emergencyPhone: "+92 325 1888841",
        whatsapp: "923251888841",
        email: "info@medicareplus.pk",
        address: "Plot 42-B, Main Boulevard, Gulberg III, Lahore, Pakistan",
        city: "Lahore",
        openingHoursWeekday: "Mon - Fri: 08:00 AM - 10:00 PM",
        openingHoursSaturday: "Saturday: 09:00 AM - 08:00 PM",
        openingHoursSunday: "Sunday: 10:00 AM - 04:00 PM (Emergency 24/7)",
        currency: "PKR",
        primaryColor: "#0f2b48",
        secondaryColor: "#0d9488",
        heroHeadline: "Leading Healthcare for You & Your Family in Lahore",
        heroSubheadline: "Board-certified specialist doctors, modern diagnostic labs, and same-day confirmed appointments in Lahore.",
        aboutText: "Medicare Plus is a premier healthcare institution in Lahore providing comprehensive medical and diagnostic services.",
      });
    }

    return NextResponse.json(settings[0], {
      headers: publicCacheHeaders(),
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const [existing] = await db.select().from(clinicSettings).limit(1);

    if (existing) {
      const [updated] = await db
        .update(clinicSettings)
        .set({
          clinicName: body.clinicName ?? existing.clinicName,
          tagline: body.tagline ?? existing.tagline,
          clinicType: body.clinicType ?? existing.clinicType,
          phone: body.phone ?? existing.phone,
          emergencyPhone: body.emergencyPhone ?? existing.emergencyPhone,
          whatsapp: body.whatsapp ?? existing.whatsapp,
          email: body.email ?? existing.email,
          address: body.address ?? existing.address,
          city: body.city ?? existing.city,
          openingHoursWeekday: body.openingHoursWeekday ?? existing.openingHoursWeekday,
          openingHoursSaturday: body.openingHoursSaturday ?? existing.openingHoursSaturday,
          openingHoursSunday: body.openingHoursSunday ?? existing.openingHoursSunday,
          currency: body.currency ?? existing.currency,
          primaryColor: body.primaryColor ?? existing.primaryColor,
          secondaryColor: body.secondaryColor ?? existing.secondaryColor,
          heroHeadline: body.heroHeadline ?? existing.heroHeadline,
          heroSubheadline: body.heroSubheadline ?? existing.heroSubheadline,
          aboutText: body.aboutText ?? existing.aboutText,
          updatedAt: new Date(),
        })
        .where(eq(clinicSettings.id, existing.id))
        .returning();

      return NextResponse.json({ success: true, settings: updated });
    } else {
      const [inserted] = await db.insert(clinicSettings).values(body).returning();
      return NextResponse.json({ success: true, settings: inserted });
    }
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}

// Preset switcher: quickly transform the clinic into Dental, Skin, Eye, Physio, Pediatric, or Multi-Specialty
export async function POST(request: Request) {
  try {
    const { preset } = await request.json();
    const [existing] = await db.select().from(clinicSettings).limit(1);

    const presetsMap: Record<string, Partial<typeof clinicSettings.$inferInsert>> = {
      dental: {
        clinicName: "Al-Shifa Advanced Dental Studio & Implantology",
        tagline: "Painless Modern Dentistry, Smile Makeovers & Implants",
        clinicType: "Dental Clinic",
        heroHeadline: "Crafting Confident, Radiant & Healthy Smiles",
        heroSubheadline: "State-of-the-art ultrasonic scaling, painless single-visit root canals, 3D dental implants, and clear aligners in Lahore.",
        aboutText: "Al-Shifa Dental Studio is a specialized boutique dentistry practice equipped with surgical microscopes, digital panoramic imaging, and painless injection systems.",
        primaryColor: "#0369a1",
        secondaryColor: "#06b6d4",
      },
      skin: {
        clinicName: "DermaGlow Aesthetic & Dermatology Clinic",
        tagline: "Advanced Clinical Dermatology, Medical Lasers & HydraFacials",
        clinicType: "Skin & Aesthetic Clinic",
        heroHeadline: "Flawless, Radiant Skin with Board-Certified Dermatologists",
        heroSubheadline: "Specialized South Asian skin treatments: Cystic acne clearance, Melasma reversal, medical HydraFacials, and anti-aging therapies.",
        aboutText: "DermaGlow combines certified medical dermatology with FDA-approved laser technologies to treat complex skin conditions safely and effectively.",
        primaryColor: "#831843",
        secondaryColor: "#ec4899",
      },
      eye: {
        clinicName: "VisionCare Laser Eye & Ophthalmology Center",
        tagline: "Precision Eye Exams, Phaco Cataract Surgery & Retina Care",
        clinicType: "Eye Clinic",
        heroHeadline: "Clear Vision for a Brighter Future",
        heroSubheadline: "Computerized refraction, advanced glaucoma screening, painless cataract phacoemulsification, and pediatric squint clinic.",
        aboutText: "VisionCare Eye Center is dedicated to preserving and restoring sight with modern diagnostic slit-lamps, OCT scans, and micro-incisional surgery.",
        primaryColor: "#1e3a8a",
        secondaryColor: "#0284c7",
      },
      physio: {
        clinicName: "ActiveLife Physical Therapy & Spine Rehabilitation",
        tagline: "Relieve Pain, Restore Movement & Regain Athletic Strength",
        clinicType: "Physiotherapy & Rehab",
        heroHeadline: "Evidence-Based Rehabilitation for Pain-Free Living",
        heroSubheadline: "Specialized recovery for Sciatica, chronic back & neck spasms, sports ACL recovery, stroke neuro-rehab, and certified dry needling.",
        aboutText: "ActiveLife Physical Therapy utilizes international biomechanical protocols to empower patients to overcome pain and live actively.",
        primaryColor: "#065f46",
        secondaryColor: "#10b981",
      },
      pediatric: {
        clinicName: "TinyCare Pediatric & Infant Wellness Clinic",
        tagline: "Gentle, Compassionate Healthcare for Newborns & Children",
        clinicType: "Pediatric Clinic",
        heroHeadline: "Nurturing Your Child's Health, Growth & Happiness",
        heroSubheadline: "Certified EPI and optional immunizations, newborn developmental milestones, nutrition counseling, and emergency pediatric care.",
        aboutText: "TinyCare is built from the ground up for children, featuring kid-friendly examination rooms, certified pediatricians, and zero-fear vaccinations.",
        primaryColor: "#7c2d12",
        secondaryColor: "#f97316",
      },
      multispecialty: {
        clinicName: "Medicare Plus",
        tagline: "WordbitX Specialty Care",
        clinicType: "Multi-Specialty",
        heroHeadline: "Leading Healthcare for You & Your Family in Lahore",
        heroSubheadline: "Board-certified specialist doctors, modern diagnostic labs, and same-day confirmed appointments in Lahore.",
        aboutText: "Medicare Plus is a premier healthcare institution providing comprehensive medical, surgical, dental, and diagnostic services in Pakistan.",
        primaryColor: "#0f2b48",
        secondaryColor: "#0d9488",
      },
    };

    const targetPreset = presetsMap[preset] || presetsMap.multispecialty;

    if (existing) {
      const [updated] = await db
        .update(clinicSettings)
        .set({
          ...targetPreset,
          updatedAt: new Date(),
        })
        .where(eq(clinicSettings.id, existing.id))
        .returning();
      return NextResponse.json({ success: true, settings: updated });
    } else {
      const [inserted] = await db.insert(clinicSettings).values(targetPreset).returning();
      return NextResponse.json({ success: true, settings: inserted });
    }
  } catch (error) {
    console.error("Error applying preset:", error);
    return NextResponse.json({ error: "Failed to apply preset" }, { status: 500 });
  }
}
