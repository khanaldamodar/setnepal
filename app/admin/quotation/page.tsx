"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CRUDTable from "@/components/admin-components/CRUDTable";

interface QuotationItemType {
  id: number;
  quotationId: number;
  productId: number;
  quantity: number;
  price: number;
  subtotal: number;
  product: {
    id: number;
    name: string;
    imageUrl: string;
    price: number;
  };
}

interface QuotationType {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  companyName: string;
  message: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  total: number;
  createdAt: string;
  updatedAt: string;
  items: QuotationItemType[];
}

const QuotationsPage = () => {
  const router = useRouter();
  const [quotations, setQuotations] = useState<QuotationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuotation, setSelectedQuotation] =
    useState<QuotationType | null>(null);

  // Fetch quotations
  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const res = await fetch("/api/quotation");
        if (!res.ok) throw new Error("Failed to fetch quotations");

        const json = await res.json();
        setQuotations(json.data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchQuotations();
  }, []);

  if (loading) return <div className="p-6 text-lg">Loading Quotations...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-300";
      case "APPROVED":
        return "bg-green-300";
      case "REJECTED":
        return "bg-red-300";
      default:
        return "bg-gray-200";
    }
  };

  return (
    <div className="h-screen flex flex-col font-poppins">
      {/* Header */}
      <div className="w-full flex items-center p-4 justify-between">
        <h3 className="text-2xl  font-bold">Quotations</h3>
      </div>

      {/* Table */}
      <div className="flex-1 p-4 w-full">
        {quotations.length > 0 ? (
          <CRUDTable
            endpoint="quotation"
            columns={["name", "email", "phone", "companyName"]}
            data={quotations}
            setData={setQuotations}
            actions={["view"]}
            renderCell={(column, row) => {
              if (column === "status") {
                return (
                  <span
                    className={`px-2 py-1 rounded ${getStatusColor(
                      row.status
                    )}`}
                  >
                    {row.status}
                  </span>
                );
              }
              if (column === "total") return `$${row.total.toFixed(2)}`;
              if (column === "actions") {
                return (
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => setSelectedQuotation(row)}
                  >
                    View Details
                  </button>
                );
              }
              return row[column as keyof QuotationType];
            }}
          />
        ) : (
          <div className="text-center text-gray-400 mt-10">
            No quotations found.
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedQuotation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-11/12 max-w-3xl overflow-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4">Quotation Details</h2>
            <button
              onClick={() => setSelectedQuotation(null)}
              className="absolute top-2 right-4 text-red-500 font-bold text-xl"
            >
              &times;
            </button>

            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {selectedQuotation.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedQuotation.email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedQuotation.phone}
              </p>
              <p>
                <strong>Company:</strong> {selectedQuotation.companyName}
              </p>
              <p>
                <strong>Address:</strong> {selectedQuotation.address}
              </p>
              <p>
                <strong>Status:</strong> {selectedQuotation.status}
              </p>
              <p>
                <strong>Total:</strong> ${selectedQuotation.total.toFixed(2)}
              </p>
              <p>
                <strong>Message:</strong> {selectedQuotation.message}
              </p>
            </div>

            {/* Items */}
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Items</h3>
              <table className="w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Product</th>
                    <th className="border px-2 py-1">Quantity</th>
                    <th className="border px-2 py-1">Price</th>
                    <th className="border px-2 py-1">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedQuotation.items.map((item) => (
                    <tr key={item.id}>
                      <td className="border px-2 py-1">{item.product.name}</td>
                      <td className="border px-2 py-1">{item.quantity}</td>
                      <td className="border px-2 py-1">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="border px-2 py-1">
                        ${item.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationsPage;
