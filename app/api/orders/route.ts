import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

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
    // const user = requireAuth(req); // uncomment if using auth
    const body = await req.json();
    const { items, shippingAddress, paymentMethod } = body;

    if (!items || !items.length) {
      return NextResponse.json(
        { message: "Order items are required" },
        { status: 400 }
      );
    }

    let total = 0;
    const orderItemsData = [];

    for (const item of items) {
      total += item.price * item.quantity;

      if (item.productId) {
        // Check if item exists as a real product
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          // Fallback: Check if it's actually a package (handling legacy/ambiguous IDs)
          const fallbackPkg = await prisma.package.findUnique({
            where: { id: item.productId },
          });

          if (fallbackPkg) {
            // Treat as Package
            // Reduce stock
            await prisma.package.update({
              where: { id: fallbackPkg.id },
              data: { stock: fallbackPkg.stock - item.quantity },
            });

            orderItemsData.push({
              packageId: fallbackPkg.id,
              quantity: item.quantity,
              price: item.price,
            });
            continue; // Skip the rest of this iteration
          }

          return NextResponse.json(
            { message: `Product with ID ${item.productId} not found` },
            { status: 400 }
          );
        }

        // It's a real product, check stock
        // if (product.stock < item.quantity)
        //   return NextResponse.json(
        //     { message: `Insufficient stock for ${product.name}` },
        //     { status: 400 }
        //   );

        // Reduce stock for real products only
        await prisma.product.update({
          where: { id: product.id },
          data: { stock: product.stock - item.quantity },
        });

        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        });
      } else if (item.packageId) {
        // Check if item exists as a package
        const pkg = await prisma.package.findUnique({
          where: { id: item.packageId },
        });

        if (!pkg) {
          return NextResponse.json(
            { message: `Package with ID ${item.packageId} not found` },
            { status: 400 }
          );
        }

        // Check stock
        // if (pkg.stock < item.quantity)
        //   return NextResponse.json(
        //     { message: `Insufficient stock for package ${pkg.name}` },
        //     { status: 400 }
        //   );

        // Reduce stock
        await prisma.package.update({
          where: { id: pkg.id },
          data: { stock: pkg.stock - item.quantity },
        });

        orderItemsData.push({
          packageId: item.packageId,
          quantity: item.quantity,
          price: item.price,
        });
      }
    }

    const order = await prisma.order.create({
      data: {
        userId: 1,
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
