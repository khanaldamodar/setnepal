import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const maintenance = await prisma.maintenance.findMany();

    if (maintenance.length === 0) {
      return NextResponse.json({
        Message: "No maintenance found!",
      });
    }
    return NextResponse.json(
      { message: "maintenance Fetched Success!", maintenance: maintenance },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to Fetch the maintenance" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string | null;
    const product = formData.get("product") as string | null;
    const message = formData.get("message") as string | null;
    if (!name || !phone || !product) {
      return NextResponse.json(
        { error: "Name, Phone and Product are required" },
        { status: 400 }
      );
    }

    // Create Member in Prisma
    const member = await prisma.maintenance.create({
      data: {
        name,
        phone,
        address: address || undefined,
        product: product || undefined,
        message: message || undefined,
      },
    });

    return NextResponse.json({ success: true, member }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/repair error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error?.message },
      { status: 500 }
    );
  }
}
