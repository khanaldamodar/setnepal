import { requireAuth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: number }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { message: "Maintenance ID is required" },
        { status: 400 }
      );
    }
    const repair = await prisma.maintenance.findUnique({
      where: { id: Number(id) },
    });

    if (!repair) {
      return NextResponse.json({ message: "Maintenance not found" }, { status: 404 });
    }

    return NextResponse.json(repair, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to fetch Maintenance", error: err },
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
      return NextResponse.json({ message: "Invalid Maintenance ID" }, { status: 400 });
    }

    const deletedMaintenance = await prisma.maintenance.delete({
      where: { id: numericId },
    });

    return NextResponse.json({
      message: "Maintenance deleted successfully",
      deletedMaintenance,
    });
  } catch (err) {
    return NextResponse.json(
      {
        Message: "Failed to Delete Maintenance",
        error: err,
      },
      { status: 500 }
    );
  }
}
