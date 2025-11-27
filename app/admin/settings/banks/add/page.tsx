"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function BankPage() {
  const router = useRouter();
  const [newBank, setNewBank] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleAddBank = async () => {
    const trimmed = newBank.trim();
    if (!trimmed) {
      toast.error("Enter bank name");
      return;
    }
    if (!file) {
      toast.error("Select a QR image");
      return;
    }

    const formData = new FormData();
    formData.append("name", trimmed);
    formData.append("qr", file);

    try {
      const res = await fetch("/api/banks", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success("Bank added successfully!");
        router.push("/admin/settings/banks");
        setNewBank("");
        setFile(null);
      } else {
        toast.error("Failed to add bank");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen justify-center font-poppins p-6">
      <main className="flex-1 max-w-2xl">
        <div className="bg-white shadow-md rounded-xl p-8">
          {/* Header */}
          <h3 className="text-2xl font-bold mb-6">Add Bank</h3>

          {/* Add Bank Form */}
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Bank Name"
              value={newBank}
              onChange={(e) => setNewBank(e.target.value)}
              className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#aec958] transition"
            />
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file && (
              <p className="text-sm text-gray-600">Selected: {file.name}</p>
            )}
            <button
              type="button"
              onClick={handleAddBank}
              className="bg-[#aec958] hover:bg-[#8da051] text-white px-6 py-2.5 rounded-md font-medium text-sm transition cursor-pointer"
            >
              Add Bank
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
