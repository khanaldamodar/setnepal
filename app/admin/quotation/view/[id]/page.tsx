"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { jsPDF } from "jspdf";
import { ArrowLeft, FileText, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProductItem {
  id: number;
  product: { name: string };
  quantity: number;
  price: number;
}

interface Quotation {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  companyName: string;
  message?: string;
  // status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  items: ProductItem[];
}

export default function QuotationViewPage() {
  const params = useParams();
  const router = useRouter();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchQuotation() {
      try {
        setLoading(true);
        const res = await fetch(`/api/quotation/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setQuotation(data.data);
        } else {
          setError(data.error || "Failed to fetch quotation");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) fetchQuotation();
  }, [params.id]);

  const downloadPDF = () => {
    if (!quotation) return;

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Quotation", 105, 20, { align: "center" });

    // Customer Info
    doc.setFontSize(12);
    let y = 35;

    doc.text(`Name: ${quotation.name}`, 20, y);
    y += 7;
    doc.text(`Company: ${quotation.companyName}`, 20, y);
    y += 7;
    doc.text(`Email: ${quotation.email}`, 20, y);
    y += 7;
    doc.text(`Phone: ${quotation.phone}`, 20, y);
    y += 7;
    doc.text(`Address: ${quotation.address}`, 20, y);
    y += 7;

    if (quotation.message) {
      doc.text(`Message: ${quotation.message}`, 20, y);
      y += 7;
    }

    // Table Header
    y += 10;
    doc.setFontSize(14);
    doc.text("Items", 20, y);
    y += 7;

    doc.setFontSize(12);
    doc.text("No", 20, y);
    doc.text("Product Name", 35, y);
    doc.text("Qty", 130, y);
    doc.text("Price", 150, y);

    y += 5;
    doc.line(20, y, 190, y);
    y += 7;

    // Table Rows
    let grandTotal = 0;

    quotation.items.forEach((item, index) => {
      const total = item.price * item.quantity;
      grandTotal += total;

      // Auto page break
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.text(String(index + 1), 20, y);
      doc.text(item.product?.name || "N/A", 35, y);
      doc.text(String(item.quantity), 130, y);
      doc.text(`Rs. ${item.price.toFixed(2)}`, 150, y);

      y += 7;
    });

    // Grand Total
    y += 5;
    doc.line(120, y, 190, y);
    y += 7;
    doc.text(`Grand Total: Rs. ${grandTotal.toFixed(2)}`, 150, y);

    // Save file
    doc.save(`quotation-${quotation.id}.pdf`);
  };

  if (loading)
    return (
      <p className="text-gray-500 p-6 text-center">Loading quotation...</p>
    );

  if (error)
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <FileText className="text-primary" /> Quotation #{quotation.id}
          </h1>
        </div>
        <Button
          onClick={downloadPDF}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          Download PDF
        </Button>
      </div>

      {/* Quotation Details */}
      <Card className="shadow-sm rounded-2xl border">
        <CardHeader>
          <CardTitle className="text-xl">Quotation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Name:</strong> {quotation.name}
          </p>
          <p>
            <strong>Email:</strong> {quotation.email}
          </p>
          <p>
            <strong>Phone:</strong> {quotation.phone}
          </p>
          <p>
            <strong>Company:</strong> {quotation.companyName}
          </p>
          <p>
            <strong>Address:</strong> {quotation.address}
          </p>
          {quotation.message && (
            <p>
              <strong>Message:</strong> {quotation.message}
            </p>
          )}
          {/* <p>
            <strong>Status:</strong>{" "}
            <Badge
              variant={quotation.status === "APPROVED" ? "default" : "outline"}
            >
              {quotation.status}
            </Badge>
          </p> */}

          <p>
            <strong>Created At:</strong>{" "}
            {new Date(quotation.createdAt).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {/* Products Table */}
      {quotation.items.length > 0 && (
        <Card className="shadow-sm rounded-2xl border">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" /> Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">#</th>
                    <th className="px-4 py-2 text-left">Product</th>
                    <th className="px-4 py-2 text-left">Quantity</th>
                    <th className="px-4 py-2 text-left">Price</th>
                    <th className="px-4 py-2 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.items.map((item, index) => (
                    <tr key={item.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2">
                        {item.product?.name || "N/A"}
                      </td>
                      <td className="px-4 py-2">{item.quantity}</td>
                      <td className="px-4 py-2">Rs. {item.price}</td>
                    </tr>
                  ))}
                  <tr className="border-t font-semibold">
                    <td colSpan={4} className="px-4 py-2 text-right">
                      Grand Total:
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
