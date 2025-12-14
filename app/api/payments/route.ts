import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";


export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req); // Admin or user
    let payments;

    if (user.role === "ADMIN") {
      // Admin can see all payments
      payments = await prisma.payment.findMany({
        include: { order: true, user: true },
      });
    } else {
      // Regular user sees only their payments
      payments = await prisma.payment.findMany({
        where: { userId: user.userId },
        include: { order: true },
      });
    }

    return NextResponse.json(payments);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

// POST: create payment
export async function POST(req: NextRequest) {
  try {
    // const user = requireAuth(req);
    const body = await req.json();
    const { orderId, amount, method, transactionId, paymentData } = body;

    if (!orderId || !amount || !method) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

    // Optional: Only allow user to pay for their own order unless ADMIN
    // if (1) {
    //   return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    // }

    const payment = await prisma.payment.create({
      data: {
        orderId,
        userId: 1,
        amount,
        method,
        transactionId,
        paymentData,
      },
      include: { order: true, user: true },
    });

    // Update order payment status if successful
    if (method === "ONLINE" || method === "ESEWA") {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: "SUCCESS" },
      });
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Failed to create payment" }, { status: 500 });
  }
}

// // PATCH: update payment (ADMIN only)
// export async function PATCH(req: NextRequest) {
//   try {
//     const user = requireAuth(req);
//     if (user.role !== "ADMIN") {
//       return NextResponse.json({ message: "Forbidden" }, { status: 403 });
//     }

//     const body = await req.json();
//     const { id, status, method, transactionId } = body;
//     if (!id) return NextResponse.json({ message: "Payment ID required" }, { status: 400 });

//     const payment = await prisma.payment.update({
//       where: { id },
//       data: { status, method, transactionId },
//       include: { order: true, user: true },
//     });

//     return NextResponse.json(payment);
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ message: "Failed to update payment" }, { status: 500 });
//   }
// }

// // DELETE: delete payment (ADMIN only)
// export async function DELETE(req: NextRequest) {
//   try {
//     const user = requireAuth(req);
//     if (user.role !== "ADMIN") {
//       return NextResponse.json({ message: "Forbidden" }, { status: 403 });
//     }

//     const { searchParams } = new URL(req.url);
//     const id = searchParams.get("id");
//     if (!id) return NextResponse.json({ message: "Payment ID required" }, { status: 400 });

//     await prisma.payment.delete({ where: { id: parseInt(id) } });

//     return NextResponse.json({ message: "Payment deleted" });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ message: "Failed to delete payment" }, { status: 500 });
//   }
// }
