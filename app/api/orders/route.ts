import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET: fetch orders
/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders
 *     tags:
 *       - Orders
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders. Admin sees all orders; regular users see only their orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   total:
 *                     type: number
 *                     example: 250
 *                   status:
 *                     type: string
 *                     example: "PENDING"
 *                   paymentStatus:
 *                     type: string
 *                     example: "PAID"
 *                   shippingAddress:
 *                     type: string
 *                     example: "Kathmandu, Nepal"
 *                   paymentMethod:
 *                     type: string
 *                     example: "COD"
 *                   user:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                   items:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         quantity:
 *                           type: integer
 *                         price:
 *                           type: number
 *                         product:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *                   payments:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         amount:
 *                           type: number
 *
 *   post:
 *     summary: Create a new order
 *     tags:
 *       - Orders
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                 example: [{ productId: 1, quantity: 2 }]
 *               shippingAddress:
 *                 type: string
 *                 example: "Kathmandu, Nepal"
 *               paymentMethod:
 *                 type: string
 *                 example: "COD"
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Validation error (missing items or insufficient stock)
 *       500:
 *         description: Server error
 *
 *   patch:
 *     summary: Update an order (admin only)
 *     tags:
 *       - Orders
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *               status:
 *                 type: string
 *                 example: "SHIPPED"
 *               paymentStatus:
 *                 type: string
 *                 example: "PAID"
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       400:
 *         description: Order ID required
 *       403:
 *         description: Forbidden (non-admin)
 *       500:
 *         description: Server error
 *
 *   delete:
 *     summary: Delete or cancel an order
 *     tags:
 *       - Orders
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID of the order to delete
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order deleted"
 *       400:
 *         description: Order ID required
 *       403:
 *         description: Forbidden (non-admin trying to delete others' orders)
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req, ["ADMIN"]);

    let orders;
    if (user.role === "ADMIN") {
      // Admin can see all orders with items and payments
      orders = await prisma.order.findMany({
        include: {
          user: true,
          items: { include: { product: true } },
          payments: true,
        },
      });
    } else {
      // Regular user sees only their orders
      orders = await prisma.order.findMany({
        where: { userId: user.userId },
        include: {
          items: { include: { product: true } },
          payments: true,
        },
      });
    }

    return NextResponse.json(orders);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

// POST: create order
// export async function POST(req: NextRequest) {
//   try {
//     // const user = requireAuth(req);
//     const body = await req.json();
//     const { items, shippingAddress, paymentMethod } = body;

//     if (!items || !items.length) {
//       return NextResponse.json({ message: "Order items are required" }, { status: 400 });
//     }

//     let total = 0;
//     const orderItemsData = [];

//     for (const item of items) {
//       const product = await prisma.product.findUnique({ where: { id: item.productId } });
//       if (!product) return NextResponse.json({ message: `Product ${item.productId} not found` }, { status: 400 });
//       if (product.stock < item.quantity) return NextResponse.json({ message: `Insufficient stock for ${product.name}` }, { status: 400 });

//       total += product.price * item.quantity;
//       orderItemsData.push({
//         productId: product.id,
//         quantity: item.quantity,
//         price: product.price,
//       });

//       // Reduce stock
//       await prisma.product.update({
//         where: { id: product.id },
//         data: { stock: product.stock - item.quantity },
//       });
//     }

//     const order = await prisma.order.create({
//       data: {
//         userId: 2,
//         total,
//         shippingAddress,
//         paymentMethod,
//         items: { create: orderItemsData },
//       },
//       include: { items: { include: { product: true } }, payments: true },
//     });

//     return NextResponse.json(order, { status: 201 });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ message: "Failed to create order" }, { status: 500 });
//   }
// }

export async function POST(req: NextRequest) {
  try {
    // const user = requireAuth(req); // uncomment if using auth
    const body = await req.json();
    const { items, shippingAddress, paymentMethod } = body;

    if (!items || !items.length) {
      return NextResponse.json({ message: "Order items are required" }, { status: 400 });
    }

    let total = 0;
    const orderItemsData = [];

    for (const item of items) {
      // Check if item exists as a real product
      const product = await prisma.product.findUnique({ where: { id: item.productId } });

      if (product) {
        // It's a real product, check stock
        if (product.stock < item.quantity)
          return NextResponse.json({ message: `Insufficient stock for ${product.name}` }, { status: 400 });

        // Reduce stock for real products only
        await prisma.product.update({
          where: { id: product.id },
          data: { stock: product.stock - item.quantity },
        });
      }

      // Use frontend price for both products & packages
      const itemTotal = item.price * item.quantity;
      total += itemTotal;

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price, 
      });
    }

    const order = await prisma.order.create({
      data: {
        userId: 1, 
        total,
        shippingAddress,
        paymentMethod,
        items: { create: orderItemsData },
      },
      include: { items: { include: { product: true } }, payments: true },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Failed to create order" }, { status: 500 });
  }
}


// PATCH: update order (admin only)
export async function PATCH(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (user.role !== "ADMIN") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { id, status, paymentStatus } = body;
    if (!id) return NextResponse.json({ message: "Order ID required" }, { status: 400 });

    const order = await prisma.order.update({
      where: { id },
      data: { status, paymentStatus },
      include: { items: { include: { product: true } }, user: true, payments: true },
    });

    return NextResponse.json(order);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Failed to update order" }, { status: 500 });
  }
}

// DELETE: cancel order
export async function DELETE(req: NextRequest) {
  try {
    const user = requireAuth(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "Order ID required" }, { status: 400 });

    const order = await prisma.order.findUnique({ where: { id: parseInt(id) } });
    if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

    if (user.role !== "ADMIN" && order.userId !== user.userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Restore stock
    const orderItems = await prisma.orderItem.findMany({ where: { orderId: order.id } });
    for (const item of orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    // Delete order
    await prisma.order.delete({ where: { id: order.id } });

    return NextResponse.json({ message: "Order deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Failed to delete order" }, { status: 500 });
  }
}


