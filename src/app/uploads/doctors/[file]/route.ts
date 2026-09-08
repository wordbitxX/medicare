import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  const safeFile = path.basename(file);
  const ext = path.extname(safeFile).toLowerCase();

  if (!MIME[ext]) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
  }

  const filePath = path.join(process.cwd(), "public", "uploads", "doctors", safeFile);

  try {
    const data = await fs.readFile(filePath);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": MIME[ext],
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }
}
