import { db, probeDatabase } from "@/db";
import {
  clinicSettings,
  doctors,
  services,
  reviews,
  blogPosts as blogPostsTable,
  faqs,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";


const BLOG_COVER_IMAGES: Record<string, string> = {
  "Cardiology": "https://images.pexels.com/photos/7653083/pexels-photo-7653083.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=760",
  "General Medicine": "https://images.pexels.com/photos/5355863/pexels-photo-5355863.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=760",
  "Dental Care": "https://images.pexels.com/photos/33216715/pexels-photo-33216715.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=760",
  "Dermatology": "https://images.pexels.com/photos/5619462/pexels-photo-5619462.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=760",
  "Pediatrics": "https://images.pexels.com/photos/7578803/pexels-photo-7578803.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=760",
  "Ophthalmology": "https://images.pexels.com/photos/5867737/pexels-photo-5867737.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=760",
  "Physiotherapy": "https://images.pexels.com/photos/32115905/pexels-photo-32115905.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=760",
  "General Surgery": "https://images.pexels.com/photos/38055771/pexels-photo-38055771.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=760",
};

function blogCoverForCategory(category: string, index: number) {
  return BLOG_COVER_IMAGES[category] || Object.values(BLOG_COVER_IMAGES)[index % Object.values(BLOG_COVER_IMAGES).length];
}

export type PublicDataResult =
  | { ok: true; data: Awaited<ReturnType<typeof getPublicClinicData>> }
  | { ok: false; detail: string };

/**
 * Same as getPublicClinicData but never throws — returns the exact database
 * error so pages can render an explanatory notice instead of crashing with a
 * generic host error page (Hostinger/Vercel "This page couldn't load").
 */
export async function getPublicClinicDataSafe(): Promise<PublicDataResult> {
  try {
    return { ok: true, data: await getPublicClinicData() };
  } catch (err: any) {
    const probe = await probeDatabase();
    return {
      ok: false,
      detail: probe.ok ? err?.message || String(err) : probe.detail,
    };
  }
}

export async function getPublicClinicData() {
  const [settingsRows, allDoctors, allServices, allReviews, allBlogPosts, allFaqs] =
    await Promise.all([
      db.select().from(clinicSettings).limit(1),
      db
        .select()
        .from(doctors)
        .where(eq(doctors.active, true))
        .orderBy(desc(doctors.featured), doctors.id),
      db
        .select()
        .from(services)
        .where(eq(services.active, true))
        .orderBy(desc(services.featured), services.id),
      db
        .select()
        .from(reviews)
        .where(eq(reviews.published, true))
        .orderBy(desc(reviews.id)),
      db
        .select()
        .from(blogPostsTable)
        .where(eq(blogPostsTable.published, true))
        .orderBy(desc(blogPostsTable.id)),
      db
        .select()
        .from(faqs)
        .where(eq(faqs.active, true))
        .orderBy(faqs.orderNumber, faqs.id),
    ]);

  const settings = settingsRows[0] ?? {
    id: 1,
    clinicName: "Medicare Plus",
    tagline: "WordbitX Specialty Care",
    clinicType: "Multi-Specialty",
    phone: "+92 325 1888841",
    emergencyPhone: "+92 325 1888841",
    whatsapp: "923251888841",
    email: "info@wordbitx.com",
    address: "Plot 42-B, Main Boulevard, Gulberg III, Lahore, Pakistan",
    city: "Lahore",
    openingHoursWeekday: "Mon - Fri: 08:00 AM - 10:00 PM",
    openingHoursSaturday: "Saturday: 09:00 AM - 08:00 PM",
    openingHoursSunday: "Sunday: 10:00 AM - 04:00 PM (Emergency 24/7)",
    currency: "PKR",
    primaryColor: "#0f2b48",
    secondaryColor: "#0d9488",
    heroHeadline: "Specialist Healthcare in Lahore, Without the Wait",
    heroSubheadline:
      "Consultant-led medical, dental and diagnostic care close to home, with clear fees and confirmed appointment times.",
    aboutText:
      "Medicare Plus is a premier healthcare institution providing comprehensive medical, surgical, dental, and diagnostic services in Pakistan.",
    updatedAt: new Date(),
  };

  // Normalize the original demo/default brand name once it exists in the database.
  // This keeps old Supabase rows from overriding the intended public brand.
  if (settingsRows[0]?.clinicName === "Medicare Plus Multi-Specialty Clinic") {
    const [normalized] = await db
      .update(clinicSettings)
      .set({ clinicName: "Medicare Plus", updatedAt: new Date() })
      .where(eq(clinicSettings.id, settingsRows[0].id))
      .returning();
    if (normalized) {
      (settings as any).clinicName = normalized.clinicName;
      (settings as any).updatedAt = normalized.updatedAt;
    }
  }

  const blogPosts = allBlogPosts.map((post, index) => ({
    ...post,
    coverImage: post.coverImage || blogCoverForCategory(post.category, index),
  }));

  // Persist fallback covers for existing demo articles that were created before
  // the blog image field was wired into the CMS. This is idempotent and never
  // overwrites an image chosen by the admin.
  const missingCoverPosts = allBlogPosts.filter((post) => !post.coverImage);
  if (missingCoverPosts.length > 0) {
    await Promise.all(
      missingCoverPosts.map((post, index) =>
        db
          .update(blogPostsTable)
          .set({ coverImage: blogCoverForCategory(post.category, index) })
          .where(eq(blogPostsTable.id, post.id))
      )
    );
  }

  return {
    settings,
    doctors: allDoctors,
    services: allServices,
    reviews: allReviews,
    blogPosts,
    faqs: allFaqs,
  };
}
