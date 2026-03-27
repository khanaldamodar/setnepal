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

    //date filter (use scheduledAt for follow-ups)
    if (from || to) {
      where.scheduledAt = {};
      if (from) where.scheduledAt.gte = new Date(from);
      if (to) where.scheduledAt.lte = new Date(to);
    }

    // created By filter
    if (createdById) {
      where.createdById = Number(createdById);
    }

    const followUps = await prisma.followUp.findMany({
      where,
      include: {
        customer: true,
        createdBy: {
          select: { name: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(followUps, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to fetch follow-ups" },
      { status: 500 }
    );
  }
}