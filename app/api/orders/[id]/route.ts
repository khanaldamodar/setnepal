import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";


export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req, ["ADMIN"]);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    if (!user.role?.includes("ADMIN"))
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { id } = await context.params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId))
      return NextResponse.json({ message: "Invalid Order ID" }, { status: 400 });

    const order = await prisma.order.findUnique({
      where: { id: numericId },
      include: {
        user: true,
        items: {
          include: {
            product: true,
            package: true, 
          },
        },
        payments: true,
      },
    });

    if (!order)
      return NextResponse.json({ message: "Order not found" }, { status: 404 });

    return NextResponse.json(order, { status: 200 });
  } catch (err: any) {
    if (err.message === "Unauthorized")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (err.message === "Forbidden")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    console.error("Error fetching order:", err);
    return NextResponse.json(
      { message: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: Update an existing order
 *     description: Update order details such as status, payment, or delivery information. Requires ADMIN role.
 *     operationId: updateOrder
 *     tags:
 *       - Orders
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Numeric ID of the order to update.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "DELIVERED"
 *               paymentStatus:
 *                 type: string
 *                 example: "PAID"
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Order updated successfully
 *       '400':
 *         description: Invalid input
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Order not found
 *       '500':
 *         description: Server error
 */

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req, ["ADMIN"]);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    if (!user.role?.includes("ADMIN"))
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { id } = await context.params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId))
      return NextResponse.json({ message: "Invalid Order ID" }, { status: 400 });

    const data = await req.json();

    const existingOrder = await prisma.order.findUnique({
      where: { id: numericId },
    });
    if (!existingOrder)
      return NextResponse.json({ message: "Order not found" }, { status: 404 });

    const updatedOrder = await prisma.order.update({
      where: { id: numericId },
      data: {
        status: data.status ?? existingOrder.status,
        paymentStatus: data.paymentStatus ?? existingOrder.paymentStatus,
        // deliveryDate: data.deliveryDate ?? existingOrder.deliveryDate,
      },
    });

    return NextResponse.json(
      { message: "Order updated successfully", order: updatedOrder },
      { status: 200 }
    );
  } catch (err: any) {
    if (err.message === "Unauthorized")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (err.message === "Forbidden")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    console.error("Error updating order:", err);
    return NextResponse.json(
      { message: "Failed to update order" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Delete an order by ID
 *     description: Permanently remove an order record and its related items/payments. Requires ADMIN role.
 *     operationId: deleteOrder
 *     tags:
 *       - Orders
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Numeric ID of the order to delete.
 *         schema:
 *           type: integer
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Order deleted successfully
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Order not found
 *       '500':
 *         description: Server error
 */

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req, ["ADMIN"]);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    if (!user.role?.includes("ADMIN"))
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { id } = await context.params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId))
      return NextResponse.json({ message: "Invalid Order ID" }, { status: 400 });

    const existingOrder = await prisma.order.findUnique({
      where: { id: numericId },
    });
    if (!existingOrder)
      return NextResponse.json({ message: "Order not found" }, { status: 404 });

    // Delete related items and payments first if foreign key constraints exist
    await prisma.orderItem.deleteMany({ where: { orderId: numericId } });
    await prisma.payment.deleteMany({ where: { orderId: numericId } });

    await prisma.order.delete({ where: { id: numericId } });

    return NextResponse.json(
      { message: "Order deleted successfully" },
      { status: 200 }
    );
  } catch (err: any) {
    if (err.message === "Unauthorized")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (err.message === "Forbidden")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    console.error("Error deleting order:", err);
    return NextResponse.json(
      { message: "Failed to delete order" },
      { status: 500 }
    );
  }
}
