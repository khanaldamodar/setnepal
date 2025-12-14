import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { uploadFileToLocal } from "@/lib/local-uploader";

export async function GET(req: NextRequest) {
  try {
    const packages = await prisma.package.findMany({
      include: {
        products: true,
        createdBy: true,
        category: true,
      },
    });
    return NextResponse.json(packages);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to fetch packages" },
      { status: 500 }
    );
  }
}

//  POST: Create a new package (with Local image upload)
export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = Number(formData.get("price"));
    const discount = Number(formData.get("discount") || 0);
    const stock = Number(formData.get("stock") || 0);
    const isFeatured = formData.get("isFeatured") === "true";
    const isActive = formData.get("isActive") !== "false";
    const imageFile = formData.get("image") as File | null;
    const productIds = formData.getAll("productIds[]").map((id) => Number(id));
    const categoryIdRaw = formData.get("categoryId");
    const categoryId = categoryIdRaw ? Number(categoryIdRaw) : null;

    if (!name || !price) {
      return NextResponse.json(
        { message: "Name and price are required" },
        { status: 400 }
      );
    }

    let imageUrl: string | null = null;
    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadFileToLocal(imageFile, "packages");
    }
    let connectProducts = undefined;
    if (productIds && productIds.length > 0) {
      const existingProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      if (existingProducts.length !== productIds.length) {
        return NextResponse.json(
          { message: "One or more products do not exist" },
          { status: 400 }
        );
      }

      connectProducts = {
        connect: existingProducts.map((p) => ({ id: p.id })),
      };
    }

    const pkg = await prisma.package.create({
      data: {
        name,
        description,
        price,
        discount,
        stock,
        imageUrl,
        isFeatured,
        isActive,
        categoryId: categoryId,
        createdById: user.userId,
        products: connectProducts,
      },
      include: { products: true },
    });

    return NextResponse.json(pkg, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/packages error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to create package" },
      { status: 500 }
    );
  }
}
