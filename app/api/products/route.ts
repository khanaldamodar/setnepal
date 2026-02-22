import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import formidable from "formidable";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { uploadFileToLocal } from "@/lib/local-uploader";

// GET: Get all products (public)

export async function GET(req: NextRequest) {
  const { search } = Object.fromEntries(req.nextUrl.searchParams);

  try {
    const products = await prisma.product.findMany({
      where: search
        ? { name: { contains: String(search)} }
        : {},
      include: {
        category: true,
        brand: true,
        packageProducts: { include: { package: true } },
      },
    });

    return NextResponse.json(products);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// PATCH: Update a product (auth required)
export async function PATCH(req: NextRequest) {
  try {
    const user = requireAuth(req);

    const body = await req.json();
    const {
      id,
      name,
      description,
      price,
      stock,
      sku,
      categoryId,
      brandId,
      weight,
      imageUrl,
      gallery,
      isFeatured,
      isActive,
    } = body;

    if (!id)
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        stock,
        sku,
        categoryId,
        brandId,
        weight,
        imageUrl,
        gallery,
        isFeatured,
        isActive,
      },
    });

    return NextResponse.json(product);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { message: err.message || "Failed to update product" },
      { status: 401 }
    );
  }
}

// DELETE: Delete a product (auth required)
export async function DELETE(req: NextRequest) {
  try {
    const user = requireAuth(req);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );

    const product = await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Product deleted", product });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { message: err.message || "Failed to delete product" },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      return await handleFormDataUpload(req, user);
    } else {
      return await handleJsonUpload(req, user);
    }
  } catch (err: any) {
    console.error("POST Error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to create product" },
      { status: err.message?.includes("Unauthorized") ? 401 : 500 }
    );
  }
}

async function handleFormDataUpload(req: NextRequest, user: any) {
  try {
    const formData = await req.formData();

    // Debug: Log all form data

    const formEntries: any = {};
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        formEntries[key] = {
          type: "File",
          name: value.name,
          size: value.size,
          mimeType: value.type,
        };
      } else {
        formEntries[key] = value;
      }
    }

    // Extract fields
    const name = formData.get("name") as string;
    const price = formData.get("price") as string;
    const description = formData.get("description") as string;
    const stock = formData.get("stock") as string;
    const categoryId = formData.get("categoryId") as string;
    const brandId = formData.get("brandId") as string;
    const weight = formData.get("weight") as string;
    const sku = formData.get("sku") as string;

    if (!name || !price) {
      return NextResponse.json(
        { message: "Name and price are required", received: { name, price } },
        { status: 400 }
      );
    }

    // Handle main image upload
    const imageFile = formData.get("image") as File;
    let imageUrl = null;

    if (imageFile && imageFile.size > 0) {
      try {
        imageUrl = await uploadFileToLocal(imageFile, "products");
      } catch (uploadError) {
        console.error("Main image upload failed:", uploadError);
      }
    }

    // Handle gallery images - MULTIPLE WAYS
    const galleryUrls: string[] = [];

    // Method 1: Support array notation (gallery[], gallery[0], gallery[1])
    const galleryFields = [
      ...formData.getAll("gallery[]"), // Array notation
      ...formData.getAll("gallery[0]"), // Indexed notation
      ...formData.getAll("gallery[1]"), // Indexed notation
      ...formData.getAll("gallery[2]"), // Indexed notation
      ...formData.getAll("gallery"), // Single field
    ].filter(
      (value, index, self) =>
        value instanceof File &&
        value.size > 0 &&
        self.findIndex((v) => v instanceof File && v.name === value.name) ===
          index
    );

    // Upload all gallery images
    for (const galleryFile of galleryFields) {
      if (galleryFile instanceof File && galleryFile.size > 0) {
        try {
          const galleryUrl = await uploadFileToLocal(
            galleryFile,
            "products/gallery"
          );
          galleryUrls.push(galleryUrl);
        } catch (uploadError) {
          console.error("Gallery image upload failed:", uploadError);
        }
      }
    }

    // Method 2: Also check for any additional file fields that might be gallery images
    // This handles cases where files are uploaded with different field names
    for (const [key, value] of formData.entries()) {
      if (
        value instanceof File &&
        value.size > 0 &&
        key !== "image" &&
        !key.startsWith("gallery") &&
        !galleryFields.includes(value)
      ) {
        try {
          const additionalImageUrl = await uploadFileToLocal(
            value,
            "products/gallery"
          );
          galleryUrls.push(additionalImageUrl);
        } catch (uploadError) {
          console.error("Additional image upload failed:", uploadError);
        }
      }
    }

    // Prepare product data
    const productData = {
      name: name.trim(),
      description: (description || "").trim(),
      price: parseFloat(price),
      stock: stock ? parseInt(stock) : 0,
      sku: sku || null,
      categoryId: categoryId ? parseInt(categoryId) : null,
      brandId: brandId ? parseInt(brandId) : null,
      weight: weight ? parseFloat(weight) : 0,
      imageUrl,
      gallery: galleryUrls.length > 0 ? galleryUrls : undefined,
      isFeatured: formData.get("isFeatured") === "true",
      isActive: formData.get("isActive") !== "false",
      createdById: user.userId,
    };

    const product = await prisma.product.create({
      data: productData,
    });

    return NextResponse.json(
      {
        ...product,
        gallery: galleryUrls, // Return parsed gallery for response
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Form data handling error:", error);
    return NextResponse.json(
      { message: "Failed to process form data: " + error.message },
      { status: 500 }
    );
  }
}

async function handleJsonUpload(req: NextRequest, user: any) {
  // ... keep your existing JSON handling code ...
}
