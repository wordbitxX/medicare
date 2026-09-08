import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getSession } from "@/lib/auth";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB
const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

function extensionForMime(mime: string) {
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  return ".jpg";
}

function safeSlug(input: string) {
  return (input || "doctor")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "doctor";
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== "super_admin" && session.role !== "receptionist")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const label = (form.get("label") as string | null) || "doctor";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image file uploaded" }, { status: 400 });
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: "Unsupported image format. Please upload JPG, PNG, or WebP." },
      { status: 415 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image is larger than 4 MB." }, { status: 413 });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "doctors");
  await fs.mkdir(uploadsDir, { recursive: true });

  const ext = extensionForMime(file.type);
  const fileName = `${safeSlug(label)}-${Date.now()}${ext}`;
  const targetPath = path.join(uploadsDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(targetPath, buffer);

  const url = `/uploads/doctors/${fileName}`;
  return NextResponse.json({ success: true, url });
}
