"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CRUDTable from "@/components/admin-components/CRUDTable";
import Cookies from "js-cookie";

interface PaymentType {
  id: number;
  orderId: string;
  amount: number;
  method: string;
  status: string;
  transactionId: string;
  paymentData: any;
}

const PaymentsPage = () => {
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch payments from API
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch("/api/payments", {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch payments");
        const data: PaymentType[] = await res.json();

        // Preprocess paymentData to a string for rendering
        const processedData = data.map((p) => ({
          ...p,
          paymentData: p.paymentData
            ? typeof p.paymentData === "object"
              ? `Amount: ${
                  p.paymentData.total_amount || p.paymentData.amount || "-"
                }, Txn: ${p.paymentData.transaction_uuid || "-"}`
              : p.paymentData
            : "-",
        }));

        setPayments(processedData);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading) return <div className="p-6 text-lg">Loading payments...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="h-screen flex flex-col font-poppins">
      {/* header */}
      <div className="w-full flex items-center p-4 shadow-md justify-between bg-[#aec958]">
        <h3 className="text-2xl text-white font-bold">Payments</h3>
      </div>

      {/* main content */}
      <div className="flex-1 p-4 w-full">
        {payments.length > 0 ? (
          <CRUDTable
            endpoint="payments"
            actions={["view", "delete"]}
            columns={["orderId", "amount", "method", "status", "transactionId"]}
            data={payments}
            setData={setPayments}
          />
        ) : (
          <div className="text-center text-gray-400 mt-10">
            No payments found.
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;
