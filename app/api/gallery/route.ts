import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadFileToLocal } from "@/lib/local-uploader";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const galleries = await prisma.gallery.findMany({
      include: { images: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(galleries, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/gallery error:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const imageFiles = formData.getAll("images") as File[];

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    // Upload all images locally
    for (const file of imageFiles) {
      if (file && file.size > 0) {
        const url = await uploadFileToLocal(file, "gallery");
        uploadedUrls.push(url);
      }
    }

    // Create Gallery and related images
    const newGallery = await prisma.gallery.create({
      data: {
        title,
        description,
        images: {
          create: uploadedUrls.map((url) => ({ url })),
        },
      },
      include: { images: true },
    });

    return NextResponse.json(newGallery, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/gallery error:", error);
    return NextResponse.json(
      { error: "Failed to create gallery" },
      { status: 500 }
    );
  }
}

// Helper: upload a single file to Cloudinary
