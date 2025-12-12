import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

// Helper function to handle form data with file uploads
export async function handleFormDataUpload(req: NextRequest, user: any) {
  const formData = await req.formData();

  // Extract text fields
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string) || 0;
  const sku = formData.get("sku") as string;
  const categoryId = parseInt(formData.get("categoryId") as string);
  const brandId = parseInt(formData.get("brandId") as string);
  const weight = parseFloat(formData.get("weight") as string) || 0;
  const isFeatured = formData.get("isFeatured") === "true";
  const isActive = formData.get("isActive") !== "false";

  if (!name || !price) {
    return NextResponse.json(
      { message: "Name and price are required" },
      { status: 400 }
    );
  }

  // Handle main image upload
  const mainImageFile = formData.get("image") as File;
  let imageUrl = "";

  if (mainImageFile) {
    try {
      const mainImageBuffer = await mainImageFile.arrayBuffer();
      const mainImageBase64 = Buffer.from(mainImageBuffer).toString("base64");
      const mainImageDataUri = `data:${mainImageFile.type};base64,${mainImageBase64}`;

      const uploadResult = await cloudinary.uploader.upload(mainImageDataUri, {
        folder: "products",
        resource_type: "image",
      });

      imageUrl = uploadResult.secure_url;
    } catch (uploadError) {
      console.error("Main image upload failed:", uploadError);
      return NextResponse.json(
        { message: "Failed to upload main image" },
        { status: 500 }
      );
    }
  }

  // Handle gallery images
  const galleryFiles = formData.getAll("gallery") as File[];
  const galleryUrls: string[] = [];

  for (const galleryFile of galleryFiles) {
    if (galleryFile) {
      try {
        const galleryBuffer = await galleryFile.arrayBuffer();
        const galleryBase64 = Buffer.from(galleryBuffer).toString("base64");
        const galleryDataUri = `data:${galleryFile.type};base64,${galleryBase64}`;

        const galleryUploadResult = await cloudinary.uploader.upload(
          galleryDataUri,
          {
            folder: "products/gallery",
            resource_type: "image",
          }
        );

        galleryUrls.push(galleryUploadResult.secure_url);
      } catch (uploadError) {
        console.error("Gallery image upload failed:", uploadError);
        // Continue with other gallery images even if one fails
      }
    }
  }

  // Create product in database
  const product = await prisma.product.create({
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
      gallery: galleryUrls,
      isFeatured,
      isActive: isActive !== undefined ? isActive : true,
      createdById: user.userId,
    },
  });

  return NextResponse.json(product, { status: 201 });
}

// Helper function for JSON data (existing functionality)
export async function handleJsonUpload(req: NextRequest, user: any) {
  const body = await req.json();
  const {
    name,
    description,
    price,
    stock,
    sku,
    categoryId,
    brandId,
    weight,
    imageUrl, // Can still accept direct URLs
    gallery, // Can still accept direct URLs
    isFeatured,
    isActive,
  } = body;

  if (!name || !price) {
    return NextResponse.json(
      { message: "Name and price are required" },
      { status: 400 }
    );
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price,
      stock: stock || 0,
      sku,
      categoryId,
      brandId,
      weight,
      imageUrl,
      gallery,
      isFeatured: !!isFeatured,
      isActive: isActive !== undefined ? isActive : true,
      createdById: user.userId,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
