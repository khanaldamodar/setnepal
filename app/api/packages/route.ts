import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { uploadFileToLocal } from "@/lib/local-uploader";

export async function GET(req: NextRequest) {
  const { search } = Object.fromEntries(req.nextUrl.searchParams);

  try {
    const packages = await prisma.package.findMany({
      where: search
        ? { name: { contains: String(search)} }
        : {},
      include: {
        packageProducts: { include: { product: true } },
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
    const categoryIdRaw = formData.get("categoryId");
    const categoryId = categoryIdRaw ? Number(categoryIdRaw) : null;

    // Expecting a JSON string for products with quantities: [{ id: 1, qty: 2 }, ...]
    const productsJson = formData.get("productsJson") as string | null;
    const productIds = formData.getAll("productIds[]").map((id) => Number(id)); // Fallback

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

    let createPackageProducts = undefined;

    if (productsJson) {
      try {
        const parsedProducts = JSON.parse(productsJson) as {
          id: number;
          qty: number;
        }[];
        if (parsedProducts.length > 0) {
          createPackageProducts = {
            create: parsedProducts.map((p) => ({
              product: { connect: { id: p.id } },
              quantity: p.qty,
            })),
          };
        }
      } catch (e) {
        console.error("Failed to parse productsJson", e);
      }
    } else if (productIds && productIds.length > 0) {
      // Fallback for backward compatibility or simple selection
      createPackageProducts = {
        create: productIds.map((id) => ({
          product: { connect: { id } },
          quantity: 1, // Default quantity
        })),
      };
    }

    const benefitsJson = formData.get("benefits") as string | null;
    let benefits: any = null;
    if (benefitsJson) {
      try {
        benefits = JSON.parse(benefitsJson);
      } catch (e) {
        console.error("Failed to parse benefits", e);
      }
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
        benefits,
        packageProducts: createPackageProducts,
      },
      include: {
        packageProducts: {
          include: {
            product: true,
          },
        },
      },
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
