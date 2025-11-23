import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // adjust path to your prisma client

export async function GET(req: Request) {
  try {
    // Fetch all quotations including their items and product details
    const quotations = await prisma.quotation.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: quotations,
    });
  } catch (error: any) {
    console.error("GET Quotations Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch quotations", details: error.message },
      { status: 500 }
    );
  }
}




export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      email,
      phone,
      address,
      companyName,
      message,
      items,
    } = body;

    // Validation
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Name, email, and phone are required" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "At least one item is required" },
        { status: 400 }
      );
    }

    // Calculate totals
    let total = 0;

    // Fetch product prices to avoid frontend manipulation
    const productIds = items.map((i: any) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const quotationItems = items.map((item: any) => {
      const product: any = products.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Product ID ${item.productId} not found`);

      const price = product.price;
      const subtotal = price * item.quantity;
      total += subtotal;

      return {
        productId: item.productId,
        quantity: item.quantity,
        price,
        subtotal,
      };
    });

    // Save quotation
    const quotation = await prisma.quotation.create({
      data: {
        name,
        email,
        phone,
        address,
        companyName,
        message,
        total,
        items: {
          create: quotationItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Quotation submitted successfully",
        quotation,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Quotation POST Error:", error);
    return NextResponse.json(
      {
        error: "Something went wrong",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
