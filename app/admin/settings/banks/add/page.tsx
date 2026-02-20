"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function BankPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [branch, setBranch] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleAddBank = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Enter bank name");
      return;
    }

    const formData = new FormData();
    formData.append("name", trimmedName);
    if (accountNumber.trim()) formData.append("accountNumber", accountNumber.trim());
    if (businessName.trim()) formData.append("businessName", businessName.trim());
    if (branch.trim()) formData.append("branch", branch.trim());
    if (file) formData.append("qr", file);

    try {
      const res = await fetch("/api/banks", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success("Bank added successfully!");
        router.push("/admin/settings/banks");
        setName("");
        setAccountNumber("");
        setBusinessName("");
        setBranch("");
        setFile(null);
      } else {
        toast.error("Failed to add bank");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  };

  return (
    <div className="flex min-h-screen justify-center font-poppins p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <main className="flex-1 max-w-2xl">
        <div className="bg-white shadow-md rounded-xl p-8">
          {/* Header */}
          <h3 className="text-2xl font-bold mb-6">Add Bank</h3>

          {/* Add Bank Form */}
          <div className="flex flex-col gap-4">
            {/* Bank Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="E.g., Himalayan Bank"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#aec958] transition"
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number
              </label>
              <input
                type="text"
                placeholder="E.g., 0123456789"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#aec958] transition"
              />
            </div>

            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name
              </label>
              <input
                type="text"
                placeholder="E.g., Set Nepal Pvt. Ltd."
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#aec958] transition"
              />
            </div>

            {/* Branch */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch
              </label>
              <input
                type="text"
                placeholder="E.g., Kathmandu"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#aec958] transition"
              />
            </div>

            {/* QR Code Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                QR Code
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#aec958] transition"
              />
              {file && (
                <p className="text-sm text-gray-600 mt-1">Selected: {file.name}</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleAddBank}
              className="bg-[#aec958] hover:bg-[#8da051] text-white px-6 py-2.5 rounded-md font-medium text-sm transition cursor-pointer"
            >
              Add Bank
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/settings/banks")}
              className="text-sm text-[#aec958] font-semibold hover:underline cursor-pointer"
            >
              ← Back to Bank List
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
