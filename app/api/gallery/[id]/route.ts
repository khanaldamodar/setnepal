import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import cloudinary from "@/lib/cloudinary"
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * @swagger
 * /api/gallery/{id}:
 *   get:
 *     summary: Get a single gallery item
 *     tags:
 *       - Gallery
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Single gallery item with images
 */
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const idNum = Number(id)


    const gallery = await prisma.gallery.findUnique({
      where: { id: idNum },
      include: { images: true },
    })

    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 })
    }

    return NextResponse.json(gallery, { status: 200 })
  } catch (error: any) {
    console.error("GET /api/gallery/[id] error:", error)
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 })
  }
}

/**
 * @swagger
 * /api/gallery/{id}:
 *   put:
 *     summary: Update gallery item
 *     description: Update gallery info and upload new images
 *     tags:
 *       - Gallery
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Gallery updated successfully
 */
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {

    const {id} = await context.params
    const idNum = Number(id)
    // const gallery = await prisma.gallery.findUnique({ where: { id: idNum } })
    const gallery = await prisma.gallery.findUnique({
  where: { id: idNum },
  include: { images: true },
})

    if (!gallery) return NextResponse.json({ error: "Gallery not found" }, { status: 404 })

    const formData = await req.formData()
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const imageFiles = formData.getAll("images") as File[]
const removedRaw = formData.get("removedImages") as string | null
const removedImages: string[] = removedRaw ? JSON.parse(removedRaw) : []

    const uploadedUrls: string[] = []

    // Upload new images if provided
    for (const file of imageFiles) {
      if (file && file.size > 0) {
        const url = await uploadFileToCloudinary(file, "gallery")
        uploadedUrls.push(url)
      }
    }

    const imagesToDelete = gallery.images.filter((img) => {
  const fileName = img.url.split("/").pop()
  return fileName && removedImages.includes(fileName)
})

for (const img of imagesToDelete) {
  const publicId = getCloudinaryPublicId(img.url)
  if (publicId) {
    await cloudinary.uploader.destroy(`gallery/${publicId}`)
  }

  await prisma.galleryImage.delete({
    where: { id: img.id },
  })
}


    // Update gallery info
    const updatedGallery = await prisma.gallery.update({
      where: { id: idNum },
      data: {
        title: title || gallery.title,
        description: description || gallery.description,
        images: {
          create: uploadedUrls.map((url) => ({ url })),
        },
      },
      include: { images: true },
    })

    return NextResponse.json(updatedGallery, { status: 200 })
  } catch (error: any) {
    console.error("PUT /api/gallery/[id] error:", error)
    return NextResponse.json({ error: "Failed to update gallery" }, { status: 500 })
  }
}

/**
 * @swagger
 * /api/gallery/{id}:
 *   delete:
 *     summary: Delete gallery item
 *     tags:
 *       - Gallery
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Gallery deleted successfully
 */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params  
    const idNum = Number(id)

    const gallery = await prisma.gallery.findUnique({
      where: { id: idNum },
      include: { images: true },
    })

    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 })
    }

    // Delete cloudinary images
    for (const img of gallery.images) {
      try {
        const publicId = getCloudinaryPublicId(img.url)
        if (publicId) await cloudinary.uploader.destroy(publicId)
      } catch (err) {
        console.warn("Cloudinary delete failed:", err)
      }
    }

    await prisma.gallery.delete({ where: { id: idNum } })

    return NextResponse.json({ message: "Gallery deleted successfully" }, { status: 200 })
  } catch (error: any) {
    console.error("DELETE /api/gallery/[id] error:", error)
    return NextResponse.json({ error: "Failed to delete gallery" }, { status: 500 })
  }
}


// Helper to upload files
async function uploadFileToCloudinary(file: File, folder: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) reject(error)
        else resolve(result!.secure_url)
      }
    )
    file.arrayBuffer().then((buffer) => uploadStream.end(Buffer.from(buffer))).catch(reject)
  })
}

// Helper to extract Cloudinary public ID
function getCloudinaryPublicId(url: string): string | null {
  try {
    const parts = url.split("/")
    const file = parts[parts.length - 1]
    return file.split(".")[0] // extract ID without extension
  } catch {
    return null
  }
}
