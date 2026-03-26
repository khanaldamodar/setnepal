import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// get all call logs for a customer
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const customerId = Number(params.id);
  if (!customerId || isNaN(customerId)) 
    return NextResponse.json({ message: "Invalid Customer ID" }, { status: 400 });

  try {
    const logs = await prisma.callLog.findMany({
      where: { customerId },
      include: {
        calledBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(logs);
  } catch (err) {
    console.error("Failed to fetch call logs:", err);
    return NextResponse.json({ message: "Failed to fetch call logs" }, { status: 500 });
  }
}


// create new call log
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
    if (!customerId || isNaN(customerId)) throw new Error("Invalid Customer ID");

    const { callStatus, response, durationLabel, notes, callTime } = await req.json();
    if (!callStatus) throw new Error("callStatus is required");
    const log = await prisma.callLog.create({
      data: {
        customerId,
        calledById: userId,
        callStatus,
        response: response || null,
        durationLabel: durationLabel || null,
        notes: notes || null,
        callTime: callTime ? new Date(callTime) : undefined,
      },
      include: {
        calledBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (err: any) {
    console.error("Call log creation error:", err);
    if (err.message === "Unauthorized") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (err.message === "Forbidden") return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    return NextResponse.json({ message: err.message || "Failed to create call log" }, { status: 500 });
  }
}