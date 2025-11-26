import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

export async function GET() {
  try {
    const banks = await prisma.banks.findMany();

    if (banks.length === 0) {
      return NextResponse.json({
        Message: "No banks found!",
      });
    }
    return NextResponse.json(
      { message: "banks Fetched Success!", banks: banks },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to Fetch the banks" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;

    const file = formData.get("qr") as File | null;

    if (!name || !file) {
      return NextResponse.json(
        { error: "Name and QR are required" },
        { status: 400 }
      );
    }

    let photoUrl: string | null = null;

    // Upload image if exists
    if (file && typeof file === "object") {
      photoUrl = await uploadFileToCloudinary(file, "banks");
    }

    // Create Bank QR in Prisma
    const bank = await prisma.banks.create({
      data: {
        name,
        qr: photoUrl || undefined,
      },
    });

    return NextResponse.json({ success: true, bank }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/banks error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error?.message },
      { status: 500 }
    );
  }
}

async function uploadFileToCloudinary(
  file: File,
  folder: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      }
    );
    file
      .arrayBuffer()
      .then((buffer) => uploadStream.end(Buffer.from(buffer)))
      .catch(reject);
  });
}
