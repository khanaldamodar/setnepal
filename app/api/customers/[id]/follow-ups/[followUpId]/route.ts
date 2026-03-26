import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";


// update follow-up
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; followUpId: string } }
) {
  try {
    await requireAuth(req, ["ADMIN"]);

    const followUpId = Number(params.followUpId);
    const body = await req.json();

    const updated = await prisma.followUp.update({
      where: { id: followUpId },
      data: body,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (err.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { message: "Failed to update follow-up" },
      { status: 500 }
    );
  }
}

