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
            package: true,
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
    

const productIds = items
  .filter((i: any) => i.productId != null) 
  .map((i: any) => i.productId);

const packageIds = items
  .filter((i: any) => i.packageId != null)
  .map((i: any) => i.packageId);

const products = await prisma.product.findMany({
  where: { id: { in: productIds } },
});
const packages = await prisma.package.findMany({
  where: { id: { in: packageIds } },
});

const quotationItems = items.map((item: any) => {
  let price = 0;

  if (item.productId) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) throw new Error(`Product ID ${item.productId} not found`);
    price = product.price;
  } else if (item.packageId) {
    const packageItem = packages.find((p) => p.id === item.packageId);
    if (!packageItem) throw new Error(`Package ID ${item.packageId} not found`);
    price = packageItem.price;
  } else {
    throw new Error("Item must have productId or packageId");
  }

  const subtotal = price * item.quantity;
  total += subtotal;

  return {
    productId: item.productId ?? undefined,
    packageId: item.packageId ?? undefined,
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
            package: true,
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
