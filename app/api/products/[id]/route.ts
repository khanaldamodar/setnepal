import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import formidable from "formidable";
import fs from "fs";
import path from "path";

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product details by ID
 *     description: Fetch a single product by its unique identifier. The response includes related category, brand, and package information.
 *     operationId: getProductById
 *     tags:
 *       - Products
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Numeric ID of the product to fetch.
 *         schema:
 *           type: integer
 *           example: 16
 *     responses:
 *       200:
 *         description: Product fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product fetched successfully
 *                 product:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 16
 *                     name:
 *                       type: string
 *                       example: "Smart Board"
 *                     description:
 *                       type: string
 *                       example: "This is the Smart Board"
 *                     price:
 *                       type: number
 *                       example: 500
 *                     stock:
 *                       type: integer
 *                       example: 50
 *                     sku:
 *                       type: string
 *                       example: "12"
 *                     weight:
 *                       type: number
 *                       example: 1
 *                     imageUrl:
 *                       type: string
 *                       example: "https://res.cloudinary.com/dbuafmoqz/image/upload/v1762336213/products/xxqbuoeqymwf4l0c3aup.png"
 *                     gallery:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "https://res.cloudinary.com/dbuafmoqz/image/upload/v1762336215/products/gallery/rdctbpdoajeoc5sns25p.jpg"
 *                     isFeatured:
 *                       type: boolean
 *                       example: true
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-11-05T09:50:20.425Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-11-05T09:50:20.425Z"
 *                     category:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         name:
 *                           type: string
 *                           example: "Electronics"
 *                     brand:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 3
 *                         name:
 *                           type: string
 *                           example: "Samsung"
 *                     packages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 22
 *                           name:
 *                             type: string
 *                             example: "Holiday Combo"
 *                           price:
 *                             type: number
 *                             example: 199.99
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to fetch product
 *
 *   put:
 *     summary: Update a product by ID
 *     description: Update existing product details such as name, price, images, and other attributes.
 *     operationId: updateProduct
 *     tags:
 *       - Products
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Numeric ID of the product to update.
 *         schema:
 *           type: integer
 *           example: 16
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Smart Board"
 *               description:
 *                 type: string
 *                 example: "Updated description for the product."
 *               price:
 *                 type: number
 *                 example: 600
 *               stock:
 *                 type: integer
 *                 example: 45
 *               sku:
 *                 type: string
 *                 example: "1234"
 *               weight:
 *                 type: number
 *                 example: 2
 *               categoryId:
 *                 type: integer
 *                 example: 1
 *               brandId:
 *                 type: integer
 *                 example: 3
 *               isFeatured:
 *                 type: boolean
 *                 example: true
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               imageUrl:
 *                 type: string
 *                 example: "https://res.cloudinary.com/dbuafmoqz/image/upload/newimage.jpg"
 *               gallery:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "https://res.cloudinary.com/dbuafmoqz/image/upload/gallery1.jpg"
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product updated successfully
 *                 product:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 16
 *                     name:
 *                       type: string
 *                       example: "Updated Smart Board"
 *                     price:
 *                       type: number
 *                       example: 600
 *       400:
 *         description: Invalid product ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid product ID
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product not found
 *       500:
 *         description: Failed to update product
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to update product
 *
 *   delete:
 *     summary: Delete a product by ID
 *     description: Permanently delete a product from the database.
 *     operationId: deleteProduct
 *     tags:
 *       - Products
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Numeric ID of the product to delete.
 *         schema:
 *           type: integer
 *           example: 16
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product deleted successfully
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product not found
 *       400:
 *         description: Invalid product ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid product ID
 *       500:
 *         description: Failed to delete product
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to delete product
 */

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
        packages: true,
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

// ✅ UPDATE PRODUCT (PUT)
// export async function PUT(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await context.params;
//     const numericId = parseInt(id, 10);

//     if (isNaN(numericId)) {
//       return NextResponse.json({ message: "Invalid product ID" }, { status: 400 });
//     }

//     const body = await req.json();

//     const {
//       name,
//       description,
//       price,
//       stock,
//       sku,
//       weight,
//       categoryId,
//       brandId,
//       isFeatured,
//       isActive,
//       imageUrl,
//       gallery,
//     } = body;

//     const existing = await prisma.product.findUnique({ where: { id: numericId } });
//     if (!existing) {
//       return NextResponse.json({ message: "Product not found" }, { status: 404 });
//     }

//     const updated = await prisma.product.update({
//       where: { id: numericId },
//       data: {
//         name,
//         description,
//         price,
//         stock,
//         sku,
//         weight,
//         categoryId,
//         brandId,
//         isFeatured,
//         isActive,
//         imageUrl,
//         gallery: Array.isArray(gallery) ? JSON.stringify(gallery) : gallery,
//       },
//     });

//     return NextResponse.json(
//       { message: "Product updated successfully", product: updated },
//       { status: 200 }
//     );
//   } catch (err) {
//     console.error("Error updating product:", err);
//     return NextResponse.json({ message: "Failed to update product" }, { status: 500 });
//   }
// }

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params; // ✅

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

    // 1️⃣ Delete Quotation Items linked to this product
    await prisma.quotationItem.deleteMany({
      where: { productId: numericId },
    });

    // 2️⃣ Delete Order Items linked to this product
    await prisma.orderItem.deleteMany({
      where: { productId: numericId },
    });

    const packages = await prisma.package.findMany({
      where: { products: { some: { id: numericId } } },
    });


    for (const pkg of packages) {
      await prisma.package.update({
        where: { id: pkg.id },
        data: { products: { disconnect: { id: numericId } } },
      });
    }

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
