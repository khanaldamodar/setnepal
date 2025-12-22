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
      return NextResponse.json({ message: "Invalid Category ID" }, { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: { id: numericId },
      include: { products: true },
    });

    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (err) {
    console.error("Error fetching category:", err);
    return NextResponse.json(
      { message: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req, ["ADMIN"]);

    const { id } = await context.params;
    const numericId = parseInt(id, 10);
    const body = await req.json();
    const { name } = body;

    if (!name || isNaN(numericId)) {
      return NextResponse.json(
        { message: "Invalid ID or missing name" },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id: numericId },
      data: { name },
    });

    return NextResponse.json(category);
  } catch (err: any) {
    console.error("Error updating category:", err);
    if (err.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (err.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(
      { message: "Failed to update category" },
      { status: 500 }
    );
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
      return NextResponse.json({ message: "Invalid Category ID" }, { status: 400 });
    }

    const deletedCategory = await prisma.category.delete({
      where: { id: numericId },
    });

    return NextResponse.json({
      message: "Category deleted successfully",
      deletedCategory,
    });
  } catch (err: any) {
    console.error("Error deleting category:", err);
    if (err.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (err.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(
      { message: "Failed to delete category" },
      { status: 500 }
    );
  }
}
