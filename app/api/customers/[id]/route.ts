import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// get single customer
export async function GET(req: NextRequest, context: any) {
  const params = await context.params; 
  const numericId = Number(params.id);
  if (!numericId) return NextResponse.json({ message: "Invalid Customer ID" }, { status: 400 });

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: numericId },
      include: {
        callLogs: {
          orderBy: { callTime: "desc" },
          include: { calledBy: { select: { id: true, name: true, email: true } } },
        },
        followUps: {
          orderBy: { scheduledAt: "asc" },
          include: { createdBy: { select: { id: true, name: true } } },
        },
      },
    });

    if (!customer) return NextResponse.json({ message: "Customer not found" }, { status: 404 });

    return NextResponse.json({ message: "Customer fetched successfully", customer });
  } catch {
    return NextResponse.json({ message: "Failed to fetch customer" }, { status: 500 });
  }
}

// update customer
export async function PUT(req: NextRequest, context: any) {
  try {
    const user = await requireAuth(req, ["ADMIN"]);
    const params = await context.params;
    const numericId = Number(params.id);
    if (!numericId) return NextResponse.json({ message: "Invalid Customer ID" }, { status: 400 });

    const body = await req.json();

    const updatedCustomer = await prisma.customer.update({
      where: { id: numericId },
      data: {
        organization_name: body.organization_name,
        contact_person_name: body.contact_person_name,
        contact_person_email: body.contact_person_email,
        contact_person_phone: body.contact_person_phone,
        email: body.email,
        phone: body.phone,
        address: body.address,
        tags: body.tags,
        note: body.note,
        status: body.status,
      },
    });

    return NextResponse.json({ message: "Customer updated successfully", customer: updatedCustomer });
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (err.message === "Forbidden") return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    return NextResponse.json({ message: "Failed to update customer" }, { status: 500 });
  }
}

// delete customer
export async function DELETE(req: NextRequest, context: any) {
  try {
    await requireAuth(req, ["ADMIN"]);
    const params = await context.params;
    const numericId = Number(params.id);
    if (!numericId) return NextResponse.json({ message: "Invalid Customer ID" }, { status: 400 });

    await prisma.customer.delete({ where: { id: numericId } });
    return NextResponse.json({ message: "Customer deleted successfully" });
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (err.message === "Forbidden") return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    return NextResponse.json({ message: "Failed to delete customer" }, { status: 500 });
  }
}