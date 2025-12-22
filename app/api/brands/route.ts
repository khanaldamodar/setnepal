import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";



export async function GET(req: NextRequest) {
  try {
    const brands = await prisma.brand.findMany({
      include: { products: true },
    });
    return NextResponse.json(brands, { status: 200 });
  } catch (err) {
    console.error("Error fetching brands:", err);
    return NextResponse.json(
      { message: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

// ✅ POST /api/brands
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req, ["ADMIN"]);

    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    const brand = await prisma.brand.create({ data: { name } });

    return NextResponse.json(brand, { status: 201 });
  } catch (err: any) {
    console.error("Error creating brand:", err);
    if (err.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (err.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(
      { message: err.message || "Failed to create brand" },
      { status: 500 }
    );
  }
}
