import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadFileToLocal } from "@/lib/local-uploader";

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
    const accountNumber = formData.get("accountNumber") as string | null;
    const businessName = formData.get("businessName") as string | null;
    const branch = formData.get("branch") as string | null;
    const file = formData.get("qr") as File | null;

    if (!name) {
      return NextResponse.json(
        { error: "Bank name is required" },
        { status: 400 }
      );
    }

    let photoUrl: string | null = null;

    // Upload image if exists
    if (file && typeof file === "object") {
      photoUrl = await uploadFileToLocal(file, "banks");
    }

    // Create Bank in Prisma
    const bank = await prisma.banks.create({
      data: {
        name,
        accountNumber: accountNumber || undefined,
        businessName: businessName || undefined,
        branch: branch || undefined,
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
