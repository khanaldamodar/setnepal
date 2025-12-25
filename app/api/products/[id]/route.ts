import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { deleteLocalFile } from "@/lib/local-uploader";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { message: "Invalid product ID" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: numericId },
      include: {
        category: true,
        brand: true,
        packageProducts: {
          include: {
            package: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Product fetched successfully", product },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error fetching product:", err);
    return NextResponse.json(
      { message: "Failed to fetch product" },
      { status: 500 }
    );
  }
}


export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // Updated type to Promise
) {
  try {
    const { id } = await context.params;

    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { message: "Invalid product ID" },
        { status: 400 }
      );
    }

    const existing = await prisma.product.findUnique({
      where: { id: numericId },
    });
    if (!existing) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    const body = await req.json(); // Safe now, client sends JSON

    const {
      name,
      description,
      price,
      stock,
      sku,
      weight,
      categoryId,
      brandId,
      isFeatured,
      isActive,
      imageUrl,
      gallery,
    } = body;

    // Handle Image Deletion on Update
    if (imageUrl && existing.imageUrl && imageUrl !== existing.imageUrl) {
      await deleteLocalFile(existing.imageUrl);
    }

    // Handle Gallery Images Deletion
    if (gallery && existing.gallery) {
      let oldGallery: string[] = [];
      let newGallery: string[] = [];

      try {
        oldGallery = Array.isArray(existing.gallery)
          ? (existing.gallery as string[])
          : JSON.parse(existing.gallery as string);
      } catch (e) {
        if (Array.isArray(existing.gallery))
          oldGallery = existing.gallery as string[];
      }

      try {
        newGallery = Array.isArray(gallery) ? gallery : JSON.parse(gallery);
      } catch (e) {
        if (Array.isArray(gallery)) newGallery = gallery;
      }

      if (Array.isArray(oldGallery) && Array.isArray(newGallery)) {
        const imagesToDelete = oldGallery.filter(
          (url) => !newGallery.includes(url)
        );
        for (const url of imagesToDelete) {
          await deleteLocalFile(url);
        }
      }
    }

    const updated = await prisma.product.update({
      where: { id: numericId },
      data: {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        sku,
        weight: Number(weight),
        categoryId: Number(categoryId),
        brandId: Number(brandId),
        isFeatured,
        isActive,
        imageUrl,
        gallery: Array.isArray(gallery) ? JSON.stringify(gallery) : gallery,
      },
    });

    return NextResponse.json({
      message: "Product updated successfully",
      product: updated,
    });
  } catch (err) {
    console.error("Error updating product:", err);
    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 }
    );
  }
}

// ✅ DELETE PRODUCT
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { message: "Invalid product ID" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: numericId },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Delete Main Image
    if (product.imageUrl) {
      await deleteLocalFile(product.imageUrl);
    }

    // Delete Gallery Images
    if (product.gallery) {
      let galleryImages: string[] = [];
      try {
        galleryImages = Array.isArray(product.gallery)
          ? (product.gallery as string[])
          : JSON.parse(product.gallery as string);
      } catch (e) {
        if (Array.isArray(product.gallery))
          galleryImages = product.gallery as string[];
      }

      if (Array.isArray(galleryImages)) {
        for (const url of galleryImages) {
          await deleteLocalFile(url);
        }
      }
    }

    // 1️⃣ Delete Quotation Items linked to this product
    await prisma.quotationItem.deleteMany({
      where: { productId: numericId },
    });

    // 2️⃣ Delete Order Items linked to this product
    await prisma.orderItem.deleteMany({
      where: { productId: numericId },
    });

    // Note: Package associations are automatically handled by Cascade delete in schema

    // 4️⃣ Clear category + brand FK
    await prisma.product.update({
      where: { id: numericId },
      data: {
        categoryId: null,
        brandId: null,
      },
    });

    await prisma.product.delete({
      where: { id: numericId },
    });

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error deleting product:", err);
    return NextResponse.json(
      { message: "Failed to delete product", error: err.message },
      { status: 500 }
    );
  }
}
