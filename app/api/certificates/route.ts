import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadFileToLocal } from "@/lib/local-uploader";

export async function GET() {
  try {
    const certificates = await prisma.certificates.findMany();

    if (certificates.length === 0) {
      return NextResponse.json({
        Message: "No certificates found!",
      });
    }
    return NextResponse.json(
      { message: "Certificates Fetched Success!", certificates: certificates },
      { status: 200 }
    );
  } catch (err) {
    NextResponse.json(
      { message: "Failed to Fetch the Certificates" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const image = formData.get("image") as File;

    if (!title || !image) {
      return NextResponse.json(
        { message: "Title and image are required" },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const imageUrl = await uploadFileToLocal(image, "certificates");

    // Save to DB
    const cert = await prisma.certificates.create({
      data: {
        title,
        image: imageUrl,
      },
    });

    return NextResponse.json(
      { message: "Created Successfully", certificate: cert },
      { status: 201 }
    );
  } catch (err) {
    console.error("Certificate upload error:", err);
    return NextResponse.json(
      { message: "Failed to upload certificate" },
      { status: 500 }
    );
  }
}
