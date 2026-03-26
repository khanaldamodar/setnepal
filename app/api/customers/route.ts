import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

//  get /api/customers
export async function GET(req: NextRequest) {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        callLogs: true,
        followUps: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(customers, { status: 200 });
  } catch (err) {
    console.error("Error fetching customers:", err);
    return NextResponse.json(
      { message: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

// post /api/customers
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req, ["ADMIN"]);

    const body = await req.json();

    const {
      organization_name,
      contact_person_name,
      contact_person_email,
      contact_person_phone,
      email,
      phone,
      address,
      leadSource,
      tags,
      note,
      status,
    } = body;

    
    if (!contact_person_name) {
      return NextResponse.json(
        { message: "Contact person name is required" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        organization_name,
        contact_person_name,
        contact_person_email,
        contact_person_phone,
        email,
        phone,
        address,
        leadSource,
        tags,
        note,
        status,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (err: any) {
    console.error("Error creating customer:", err);

    if (err.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (err.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { message: err.message || "Failed to create customer" },
      { status: 500 }
    );
  }
}