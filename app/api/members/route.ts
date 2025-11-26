import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary"

export async function GET() {
  try {
    const members = await prisma.members.findMany();

    if (members.length === 0) {
      return NextResponse.json({
        Message: "No members found!",
      });
    }
    return NextResponse.json(
      { message: "members Fetched Success!", "members": members },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to Fetch the members" },
      { status: 500 }
    );
  }
}



export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string | null;
    const desc = formData.get("desc") as string | null;
    const designation = formData.get("designation") as string | null;
    const file = formData.get("photo") as File | null;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and Phone are required" },
        { status: 400 }
      );
    }

    let photoUrl: string | null = null;

    // Upload image if exists
    if (file && typeof file === "object") {
      photoUrl = await uploadFileToCloudinary(file, "members");
    }

    // Create Member in Prisma
    const member = await prisma.members.create({
      data: {
        name,
        phone,
        email: email || undefined,
        desc: desc || undefined,
        designation: designation || undefined,
        photo: photoUrl || undefined,
      },
    });

    return NextResponse.json({ success: true, member }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/members error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error?.message },
      { status: 500 }
    );
  }
}

async function uploadFileToCloudinary(file: File, folder: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) reject(error)
        else resolve(result!.secure_url)
      }
    )
    file.arrayBuffer().then((buffer) => uploadStream.end(Buffer.from(buffer))).catch(reject)
  })
}
