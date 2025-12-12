import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const apiSecret = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;

    const configStatus = {
      cloudName: cloudName ? `${cloudName.substring(0, 3)}...` : "MISSING",
      apiKey: apiKey ? `${apiKey.substring(0, 3)}...` : "MISSING",
      apiSecret: apiSecret ? "PRESENT (Hidden)" : "MISSING",
    };

    // Attempt a simple ping to Cloudinary API to verify credentials
    let connectionStatus = "Unknown";
    let connectionError = null;

    try {
      const result = await cloudinary.api.ping();
      connectionStatus = "Connected";
    } catch (err: any) {
      connectionStatus = "Failed";
      connectionError = err.message || err;
    }

    return NextResponse.json(
      {
        success: connectionStatus === "Connected",
        environmentVariables: configStatus,
        connection: connectionStatus,
        error: connectionError,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
