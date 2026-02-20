"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CRUDTable from "@/components/admin-components/CRUDTable";

interface BankType {
  id: number;
  name: string;
  accountNumber?: string;
  businessName?: string;
  branch?: string;
  qr: string; // URL or path to QR image
}

const BanksPage = () => {
  const router = useRouter();
  const [banks, setBanks] = useState<BankType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch banks from API
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await fetch("/api/banks");
        if (!res.ok) throw new Error("Failed to fetch banks");

        const data = await res.json();
        if (Array.isArray(data.banks)) {
          setBanks(data.banks);
        } else {
          setBanks([]);
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchBanks();
  }, []);

  if (loading) return <div className="p-6 text-lg">Loading banks...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="h-screen flex flex-col font-poppins">
      {/* header */}
      <div className="w-full flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold">Banks</h3>
        <button
          onClick={() => router.push("/admin/settings/banks/add")}
          className="bg-[#aec958] rounded-2xl text-white px-4 py-2 hover:bg-green-100 transition cursor-pointer"
        >
          Add Bank
        </button>
      </div>

      {/* main content */}
      <div className="flex-1 p-4 w-full">
        {banks.length > 0 ? (
          <CRUDTable
            endpoint="settings/banks" // frontend route
            apiEndpoint="banks" // backend API route
            columns={["name", "accountNumber", "businessName", "branch", "qr"]}
            data={banks}
            actions={["edit", "delete"]}
            setData={setBanks}
            renderCell={(column, row) => {
              if (column === "qr") {
                return row.qr ? (
                  <img
                    src={row.qr}
                    alt={row.name + " QR"}
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <span className="text-gray-400">No QR</span>
                );
              }
              if (column === "accountNumber") {
                return row.accountNumber || <span className="text-gray-400">-</span>;
              }
              if (column === "businessName") {
                return row.businessName || <span className="text-gray-400">-</span>;
              }
              if (column === "branch") {
                return row.branch || <span className="text-gray-400">-</span>;
              }
              return row[column];
            }}
          />
        ) : (
          <div className="text-center text-gray-400 mt-10">No banks found.</div>
        )}
      </div>
    </div>
  );
};

export default BanksPage;
