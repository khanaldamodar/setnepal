import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const {id} = await context.params
    const numericId = parseInt(id, 10);

    console.log(numericId)

    if (isNaN(numericId)) {
      return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
    }

    const quotation = await prisma.quotation.findUnique({
      where: {id: numericId},
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!quotation) {
      return NextResponse.json({ success: false, error: "Quotation not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: quotation });
  } catch (error: any) {
    console.error("GET Quotation by ID Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch quotation", details: error.message },
      { status: 500 }
    );
  }
}
