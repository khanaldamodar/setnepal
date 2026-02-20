import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req, ["ADMIN"]);

    let orders;
    if (user.role === "ADMIN") {
      // Admin can see all orders with items and payments
      orders = await prisma.order.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: { include: { product: true, package: true } },
          payments: true,
        },
      });
    } else {
      // Regular user sees only their orders
      orders = await prisma.order.findMany({
        where: { userId: user.userId },
        include: {
          items: { include: { product: true, package: true } },
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
    const body = await req.json();
    const { items, shippingAddress, paymentMethod, user: userData } = body;

    if (!items || !items.length) {
      return NextResponse.json(
        { message: "Order items are required" },
        { status: 400 }
      );
    }

    if (!userData || !userData.email || !userData.name || !userData.phone) {
      return NextResponse.json(
        { message: "User information is required" },
        { status: 400 }
      );
    }


    let user = await prisma.user.findUnique({ where: { email: userData.email } });

    if (!user) {
      
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          password: hashedPassword,
          role: "USER",
        },
      });
    }

    const userId = user.id;

    
    let total = 0;
    const orderItemsData = [];

    for (const item of items) {
      total += item.price * item.quantity;

      if (item.productId) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          const fallbackPkg = await prisma.package.findUnique({
            where: { id: item.productId },
          });

          if (fallbackPkg) {
            await prisma.package.update({
              where: { id: fallbackPkg.id },
              data: { stock: fallbackPkg.stock - item.quantity },
            });

            orderItemsData.push({
              packageId: fallbackPkg.id,
              quantity: item.quantity,
              price: item.price,
            });
            continue;
          }

          return NextResponse.json(
            { message: `Product with ID ${item.productId} not found` },
            { status: 400 }
          );
        }

        await prisma.product.update({
          where: { id: product.id },
          data: { stock: product.stock - item.quantity },
        });

        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: item.price,
        });
      } else if (item.packageId) {
        const pkg = await prisma.package.findUnique({
          where: { id: item.packageId },
        });

        if (!pkg) {
          return NextResponse.json(
            { message: `Package with ID ${item.packageId} not found` },
            { status: 400 }
          );
        }

        await prisma.package.update({
          where: { id: pkg.id },
          data: { stock: pkg.stock - item.quantity },
        });

        orderItemsData.push({
          packageId: pkg.id,
          quantity: item.quantity,
          price: item.price,
        });
      }
    }

    
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        shippingAddress,
        paymentMethod,
        items: { create: orderItemsData },
      },
      include: {
        items: { include: { product: true, package: true } },
        payments: true,
      },
    });

    
if (paymentMethod === "BANK" && body.bankId && body.transactionId) {
  const paymentPayload = {
    orderId: order.id,
    userId: userId,
    amount: total,
    method: "ONLINE" as const,
    status: "SUCCESS" as const,
    paymentData: {
      bankName: body.bankName,
      qr: body.qr,
      transactionId: body.transactionId,
    },
  };

  await prisma.payment.create({ data: paymentPayload });
}

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to create order" },
      { status: 500 }
    );
  }
}

// PATCH: update order (admin only)
export async function PATCH(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (user.role !== "ADMIN")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { id, status, paymentStatus } = body;
    if (!id)
      return NextResponse.json(
        { message: "Order ID required" },
        { status: 400 }
      );

    const order = await prisma.order.update({
      where: { id },
      data: { status, paymentStatus },
      include: {
        items: { include: { product: true, package: true } },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        payments: true,
      },
    });

    return NextResponse.json(order);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to update order" },
      { status: 500 }
    );
  }
}

// DELETE: cancel order
export async function DELETE(req: NextRequest) {
  try {
    const user = requireAuth(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id)
      return NextResponse.json(
        { message: "Order ID required" },
        { status: 400 }
      );

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
    });
    if (!order)
      return NextResponse.json({ message: "Order not found" }, { status: 404 });

    if (user.role !== "ADMIN" && order.userId !== user.userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Restore stock
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: order.id },
    });
    for (const item of orderItems) {
      if (item.productId) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      } else if (item.packageId) {
        await prisma.package.update({
          where: { id: item.packageId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    // Delete order
    await prisma.order.delete({ where: { id: order.id } });

    return NextResponse.json({ message: "Order deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to delete order" },
      { status: 500 }
    );
  }
}
