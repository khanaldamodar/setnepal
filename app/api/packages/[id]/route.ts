import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { uploadFileToLocal, deleteLocalFile } from "@/lib/local-uploader";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { message: "Invalid Package ID" },
        { status: 400 }
      );
    }

    const pkg = await prisma.package.findUnique({
      where: { id: numericId },
      include: {
        packageProducts: {
          include: {
            product: true,
          },
        },
        createdBy: true,
      },
    });

    if (!pkg) {
      return NextResponse.json(
        { message: "Package not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(pkg, { status: 200 });
  } catch (err) {
    console.error("Error fetching package:", err);
    return NextResponse.json(
      { message: "Failed to fetch package" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAuth(req);
    const { id } = await context.params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { message: "Invalid Package ID" },
        { status: 400 }
      );
    }

    const formData = await req.formData();

    // Extract fields
    const name = formData.get("name") as string | null;
    const description = formData.get("description") as string | null;
    const price = formData.get("price") ? Number(formData.get("price")) : null;
    const discount = formData.get("discount")
      ? Number(formData.get("discount"))
      : null;
    const stock = formData.get("stock") ? Number(formData.get("stock")) : null;
    const isFeatured =
      formData.get("isFeatured") !== null
        ? formData.get("isFeatured") === "true"
        : null;
    const isActive =
      formData.get("isActive") !== null
        ? formData.get("isActive") === "true"
        : null;

    const categoryIdRaw = formData.get("categoryId");
    const categoryId =
      categoryIdRaw && categoryIdRaw !== "null" && categoryIdRaw !== ""
        ? Number(categoryIdRaw)
        : null;

    const imageFile = formData.get("image") as File | null;

    const productsJson = formData.get("productsJson") as string | null;
    const productIdsRaw = formData.getAll("productIds[]");

    // Ensure package exists
    const existingPackage = await prisma.package.findUnique({
      where: { id: numericId },
    });

    if (!existingPackage) {
      return NextResponse.json(
        { message: "Package not found" },
        { status: 404 }
      );
    }

    // Validate category
    if (categoryId !== null) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!categoryExists) {
        return NextResponse.json(
          { message: "Invalid categoryId — category does not exist" },
          { status: 400 }
        );
      }
    }

    // Validate products and prepare update
    let updatePackageProducts: any = undefined;

    if (productsJson) {
      try {
        const parsedProducts = JSON.parse(productsJson) as {
          id: number;
          qty: number;
        }[];
        if (parsedProducts.length > 0) {
          updatePackageProducts = {
            deleteMany: {}, // Remove all old relations
            create: parsedProducts.map((p) => ({
              product: { connect: { id: p.id } },
              quantity: p.qty,
            })),
          };
        }
      } catch (e) {
        console.error("Failed to parse productsJson", e);
      }
    } else if (productIdsRaw.length > 0) {
      // Fallback
      const productIds = productIdsRaw.map((id) => Number(id));
      updatePackageProducts = {
        deleteMany: {},
        create: productIds.map((id) => ({
          product: { connect: { id } },
          quantity: 1,
        })),
      };
    }

    // Upload new image if provided
    let imageUrl = existingPackage.imageUrl;
    if (imageFile && imageFile.size > 0) {
      if (existingPackage.imageUrl) {
        await deleteLocalFile(existingPackage.imageUrl);
      }
      imageUrl = await uploadFileToLocal(imageFile, "packages");
    }

    const benefitsJson = formData.get("benefits") as string | null;
    let benefits: any = undefined;
    if (benefitsJson !== null) {
      try {
        benefits = JSON.parse(benefitsJson);
      } catch (e) {
        console.error("Failed to parse benefits", e);
      }
    }

    // Update package
    const updatedPackage = await prisma.package.update({
      where: { id: numericId },
      data: {
        name: name ?? undefined,
        description: description ?? undefined,
        price: price ?? undefined,
        discount: discount ?? undefined,
        stock: stock ?? undefined,
        isFeatured: isFeatured ?? undefined,
        isActive: isActive ?? undefined,
        categoryId,
        imageUrl,
        benefits: benefits,
        packageProducts: updatePackageProducts,
      },
      include: {
        packageProducts: {
          include: {
            product: true,
          },
        },
        createdBy: true,
      },
    });

    return NextResponse.json(
      {
        message: "Package updated successfully",
        package: updatedPackage,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("PUT /api/packages error:", err);
    return NextResponse.json(
      { message: "Failed to update package" },
      { status: 500 }
    );
  }
}

// ✅ DELETE /api/packages/[id]
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { message: "Invalid Package ID" },
        { status: 400 }
      );
    }

    const existingPackage = await prisma.package.findUnique({
      where: { id: numericId },
    });

    if (!existingPackage) {
      return NextResponse.json(
        { message: "Package not found" },
        { status: 404 }
      );
    }

    // Delete the package (if product relationships exist, they’ll be handled by Prisma)
    if (existingPackage.imageUrl) {
      await deleteLocalFile(existingPackage.imageUrl);
    }
    await prisma.package.delete({ where: { id: numericId } });

    return NextResponse.json(
      { message: "Package deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error deleting package:", err);
    return NextResponse.json(
      { message: "Failed to delete package" },
      { status: 500 }
    );
  }
}
