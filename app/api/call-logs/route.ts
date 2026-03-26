// app/api/call-logs/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req, ["ADMIN"]);

    const callLogs = await prisma.callLog.findMany({
      include: {
        customer: true, // Include customer info
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(callLogs, { status: 200 });
  } catch (err: any) {
    console.error("Error fetching call logs:", err);

    if (err.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (err.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { message: "Failed to fetch call logs" },
      { status: 500 }
    );
  }
}