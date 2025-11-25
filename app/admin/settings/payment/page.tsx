"use client";

import React, { useState } from "react";
import { HiOutlineCreditCard } from "react-icons/hi";
import { AiOutlineBank } from "react-icons/ai";
import { FaFileUpload } from "react-icons/fa";

export default function PaymentPage() {
  const [method, setMethod] = useState(""); // e-sewa or bank
  const [banks, setBanks] = useState([
    "Bank A",
    "Bank B",
    "Bank C",
    "Bank D",
    "Bank E",
  ]);
  const [newBank, setNewBank] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleAddBank = () => {
    const trimmed = newBank.trim();
    if (trimmed && !banks.includes(trimmed)) {
      setBanks([...banks, trimmed]);
      setNewBank("");
    }
  };

  return (
    <div className="flex min-h-screen justify-center font-poppins p-6">
      <main className="flex-1 max-w-4xl">
        <div className="bg-white shadow-md rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6">Payment Settings</h2>

          {/* Payment Method */}
          <div className="flex flex-col gap-4 mb-6">
            <Label label="Payment Method" icon={<HiOutlineCreditCard />} />
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="method"
                  value="e-sewa"
                  checked={method === "e-sewa"}
                  onChange={(e) => setMethod(e.target.value)}
                />
                e-Sewa
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="method"
                  value="bank"
                  checked={method === "bank"}
                  onChange={(e) => setMethod(e.target.value)}
                />
                Bank
              </label>
            </div>
          </div>

          {/* Bank Options */}
          {method === "bank" && (
            <div className="flex flex-col gap-4 mb-6">
              <Label label="Select Bank" icon={<AiOutlineBank />} />
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#aec958] transition"
              >
                <option value="">--Choose a bank--</option>
                {banks.map((bank, idx) => (
                  <option key={idx} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>

              {/* Add new bank */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add new bank"
                  value={newBank}
                  onChange={(e) => setNewBank(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#aec958] transition"
                />
                <button
                  type="button"
                  onClick={handleAddBank}
                  className="bg-[#aec958] hover:bg-[#8da051] text-white px-4 rounded-md transition"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* File Upload */}
          <div className="flex flex-col gap-2 mb-6">
            <Label label="Upload File" icon={<FaFileUpload />} />
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {file.name}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-4">
            <button
              type="button"
              className="bg-[#aec958] hover:bg-[#9bb648] text-white px-6 py-2.5 rounded-md font-medium text-sm transition"
            >
              Save Payment Settings
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// Reusable Label
const Label = ({ label, icon }: any) => (
  <label className="text-gray-700 text-sm font-medium flex items-center gap-2.5">
    {icon && (
      <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#aec958]">
        {icon}
      </span>
    )}
    {label}
  </label>
);
