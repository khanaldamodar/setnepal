import { requireAuth } from "@/lib/auth";
import { uploadFileToLocal, deleteLocalFile } from "@/lib/local-uploader";
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
      return NextResponse.json(
        { message: "Invalid Member ID" },
        { status: 400 }
      );
    }

    const member = await prisma.members.findUnique({
      where: { id: numericId },
    });

    if (!member) {
      return NextResponse.json(
        { message: "Member not found" },
        { status: 404 }
      );
    }

    if (member.photo) {
      await deleteLocalFile(member.photo);
    }

    const deletedmembers = await prisma.members.delete({
      where: { id: numericId },
    });

    return NextResponse.json({
      message: "Member deleted successfully",
      deletedmembers,
    });
  } catch (err) {
    return NextResponse.json(
      {
        Message: "Failed to Delete Member",
        error: err,
      },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { message: "Member ID is required" },
        { status: 400 }
      );
    }

    const formData = await req.formData();

    const name = formData.get("name") as string | null;
    const phone = formData.get("phone") as string | null;
    const email = formData.get("email") as string | null;
    const desc = formData.get("desc") as string | null;
    const designation = formData.get("designation") as string | null;
    const file = formData.get("photo") as File | null;

    // Fetch existing member
    const existing = await prisma.members.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Member not found" },
        { status: 404 }
      );
    }

    let photoUrl = existing.photo; // keep existing by default

    // ❗ If new file uploaded → upload to Cloudinary
    if (file && typeof file === "object") {
      if (existing.photo) {
        await deleteLocalFile(existing.photo);
      }
      photoUrl = await uploadFileToLocal(file, "members");
    }

    // Update the member
    const updatedMember = await prisma.members.update({
      where: { id: Number(id) },
      data: {
        name: name ?? existing.name,
        phone: phone ?? existing.phone,
        email: email ?? existing.email,
        desc: desc ?? existing.desc,
        designation: designation ?? existing.designation,
        photo: photoUrl,
      },
    });

    return NextResponse.json(
      {
        message: "Member updated successfully!",
        member: updatedMember,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PUT /api/members/[id] error:", error);

    return NextResponse.json(
      { message: "Failed to update member", error: error?.message },
      { status: 500 }
    );
  }
}
