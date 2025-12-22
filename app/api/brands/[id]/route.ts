import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";


export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { message: "Invalid Brand ID" },
        { status: 400 }
      );
    }

    const brand = await prisma.brand.findUnique({
      where: { id: numericId },
      include: { products: true }, // optional
    });

    if (!brand) {
      return NextResponse.json({ message: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json(brand);
  } catch (err) {
    console.error("Error fetching brand:", err);
    return NextResponse.json(
      { message: "Failed to fetch brand" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req, ["ADMIN"]); // throws if not admin

    const { id } = await context.params;
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ message: "Missing name" }, { status: 400 });
    }

    const brand = await prisma.brand.update({
      where: { id: parseInt(id, 10) },
      data: { name },
    });

    return NextResponse.json(brand, { status: 200 });
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (err.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ message: "Failed to update brand" }, { status: 500 });
  }
}


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
        { message: "Invalid Brand ID" },
        { status: 400 }
      );
    }

    const deletedBrand = await prisma.brand.delete({
      where: { id: numericId },
    });

    return NextResponse.json({
      message: "Brand deleted successfully",
      deletedBrand,
    });
  } catch (err: any) {
    console.error("Error deleting brand:", err);
    if (err.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (err.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(
      { message: "Failed to delete brand" },
      { status: 500 }
    );
  }
}
