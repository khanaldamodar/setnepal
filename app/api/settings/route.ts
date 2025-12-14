import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadFileToLocal, deleteLocalFile } from "@/lib/local-uploader";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get website settings
 *     description: Fetches the current website or company settings (e.g., company name, social links, contact info).
 *     tags:
 *       - Settings
 *     responses:
 *       200:
 *         description: Successfully fetched settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Internal server error
 */
export async function GET() {
  try {
    const settings = await prisma.settings.findFirst();
    return NextResponse.json(settings ?? { message: "No settings found" }, {
      status: 200,
    });
  } catch (error: any) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let data: any = {};

    if (contentType.includes("multipart/form-data")) {
      // --- Handle FormData Upload ---
      const formData = await req.formData();

      // Extract fields
      for (const [key, value] of formData.entries()) {
        if (typeof value === "string") data[key] = value;
      }

      // Handle logo upload
      const logoFile = formData.get("logo") as File | null;
      if (logoFile && logoFile.size > 0) {
        const logoUrl = await uploadFileToLocal(logoFile, "settings");
        data.logo = logoUrl;
      }

      // Handle favicon upload
      const faviconFile = formData.get("favicon") as File | null;
      if (faviconFile && faviconFile.size > 0) {
        const faviconUrl = await uploadFileToLocal(faviconFile, "settings");
        data.favicon = faviconUrl;
      }
    } else {
      // --- Handle JSON Update ---
      data = await req.json();
    }

    // --- Update or Create Settings Record ---
    let settings = await prisma.settings.findFirst();
    if (settings) {
      // Cleanup old logo if new one provided
      if (data.logo && settings.logo && data.logo !== settings.logo) {
        await deleteLocalFile(settings.logo);
      }
      // Cleanup old favicon if new one provided
      if (
        data.favicon &&
        settings.favicon &&
        data.favicon !== settings.favicon
      ) {
        await deleteLocalFile(settings.favicon);
      }

      settings = await prisma.settings.update({
        where: { id: settings.id },
        data,
      });
    } else {
      settings = await prisma.settings.create({ data });
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error: any) {
    console.error("PUT /api/settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
