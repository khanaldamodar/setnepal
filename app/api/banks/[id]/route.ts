import { requireAuth } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req, ["ADMIN"]);
    const { id } = await context.params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return NextResponse.json({ message: "Invalid Bank ID" }, { status: 400 });
    }

    const deletedbanks = await prisma.banks.delete({
      where: { id: numericId },
    });

    return NextResponse.json({
      message: "Bank deleted successfully",
      deletedbanks,
    });
  } catch (err) {
    return NextResponse.json(
      {
        Message: "Failed to Delete BANK",
        error: err,
      },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: number }> }
) {
  try {
    const { id } = await context.params;
     
    if (!id) {
      return NextResponse.json(
        { message: "Bank ID is required" },
        { status: 400 }
      );
    }
    const bank = await prisma.banks.findUnique({
      where: { id: Number(id) },
    });

    if (!bank) {
      return NextResponse.json(
        { message: "Bank not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(bank, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to fetch Bank", error: err },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { message: "Bank ID is required" },
        { status: 400 }
      );
    }

    const formData = await req.formData();

    const name = formData.get("name") as string | null;
    const file = formData.get("qr") as File | null;

    // Fetch existing member
    const existing = await prisma.banks.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return NextResponse.json({ message: "Bank not found" }, { status: 404 });
    }

    let photoUrl = existing.qr; // keep existing by default

    // If new file uploaded → upload to Cloudinary
    if (file && typeof file === "object") {
      photoUrl = await uploadFileToCloudinary(file, "banks");
    }

    // Update the member
    const updatedBank = await prisma.banks.update({
      where: { id: Number(id) },
      data: {
        name: name ?? existing.name,
        qr: photoUrl,
      },
    });

    return NextResponse.json(
      {
        message: "Bank updated successfully!",
        member: updatedBank,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PUT /api/banks/[id] error:", error);

    return NextResponse.json(
      { message: "Failed to update Bank", error: error?.message },
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
