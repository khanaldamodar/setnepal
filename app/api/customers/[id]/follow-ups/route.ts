import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const customerId = Number(params.id);
  if (!customerId) return NextResponse.json({ message: "Invalid Customer ID" }, { status: 400 });

  try {
    const followUps = await prisma.followUp.findMany({
      where: { customerId },
      include: {
        createdBy: { select: { id: true, name: true } }, 
      },
      orderBy: { scheduledAt: "asc" },
    });

    return NextResponse.json(followUps);
  } catch (err) {
    console.error("Failed to fetch follow-ups:", err);
    return NextResponse.json({ message: "Failed to fetch follow-ups" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    const auth = await requireAuth(req, ["ADMIN"]);
    const userId = auth.userId;
    if (!userId) throw new Error("Authenticated user ID missing");

    
    const resolvedParams = await params;
    const customerId = Number(resolvedParams.id);
    if (!customerId) throw new Error("Invalid Customer ID");

    
    const { scheduledAt, notes, status } = await req.json();

    if (!scheduledAt) throw new Error("scheduledAt is required");
    const date = new Date(scheduledAt);
    if (isNaN(date.getTime())) throw new Error("Invalid scheduledAt date");

    
    const validStatuses = ["PENDING", "COMPLETED", "MISSED"];
    const followUpStatus = status && validStatuses.includes(status) ? status : "PENDING";

    
    const followUp = await prisma.followUp.create({
      data: {
        customerId,
        scheduledAt: date,
        notes: notes || null,
        status: followUpStatus,
        createdById: userId,
      },
    });

    
    return NextResponse.json(followUp, { status: 201 });
  } catch (err: any) {
    console.error("Follow-up creation error:", err);

    if (err.message === "Unauthorized")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (err.message === "Forbidden")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    return NextResponse.json(
      { message: err.message || "Failed to create follow-up" },
      { status: 500 }
    );
  }
}