import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const productCount = await prisma.product.count();
    const packageCount = await prisma.package.count();
    const categoriesCount = await prisma.category.count();
    const brandsCount = await prisma.brand.count();
    const orderCount = await prisma.order.count();
    const paymentCount = await prisma.payment.count();

    return NextResponse.json(
      {
        Message: "Dashboard Details Fetched",
        totalProducts: productCount,
        totalPackages: packageCount,
        totalCategories: categoriesCount,
        totalBrands: brandsCount,
        totalOrders: orderCount,
        totalPayments: paymentCount,
      },
      { status: 200 }
    );
  } catch (ex) {
    NextResponse.json(
      {
        Message: "Failed to Fetch the Dashobard Data",
      },
      { status: 500 }
    );
  }
}
