import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, ["ADMIN"]);

    const { searchParams } = new URL(req.url);

    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const createdById = searchParams.get("createdById");

    const where: any = {};

    if (from || to) {
      where.callTime = {};
      if (from) where.callTime.gte = new Date(from);
      if (to) where.callTime.lte = new Date(to);
    }

    if (createdById) {
      where.calledById = Number(createdById);
    }

    const callLogs = await prisma.callLog.findMany({
      where,
      include: {
        customer: true,
        calledBy: {
          select: { name: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(callLogs);
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to fetch call logs" },
      { status: 500 }
    );
  }
}