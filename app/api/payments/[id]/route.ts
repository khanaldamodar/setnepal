import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";


export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAuth(req); // Admin or user
    const { id } = await context.params;
    let payments;

    if (user.role === "ADMIN") {
      // Admin can see all payments
      payments = await prisma.payment.findUnique({
        where: { id: parseInt(id, 10) },
        include: { order: true, user: true },
      });

      if (!payments) {
        return NextResponse.json(
          { message: "Payment not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(payments);
    }

    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAuth(req);
    const { id } = await context.params;

    if (user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const existingPayment = await prisma.payment.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!existingPayment) {
      return NextResponse.json({ message: "Payment not found" }, { status: 404 });
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: parseInt(id, 10) },
      data: {
        amount: data.amount ?? existingPayment.amount,
        method: data.method ?? existingPayment.method,
        status: data.status ?? existingPayment.status,
      },
      include: { order: true, user: true },
    });

    return NextResponse.json(
      { message: "Payment updated successfully", payment: updatedPayment },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAuth(req);
    const { id } = await context.params;

    if (user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const existingPayment = await prisma.payment.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!existingPayment) {
      return NextResponse.json({ message: "Payment not found" }, { status: 404 });
    }

    await prisma.payment.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json(
      { message: "Payment deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

