"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { usePost } from "@/services/usePost";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface BrandType {
  name: string;
}

export default function AddBrandPage() {
  const router = useRouter();
  const [brand, setBrand] = useState<BrandType>({ name: "" });

  const { postData, loading, error } = usePost<BrandType>("/api/brands");

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get("token");

    try {
      await postData(brand, token);
      toast.success("Brand added successfully!");
      setBrand({ name: "" });
    } catch (err) {
      console.error(err);
      toast.error(error?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 shadow rounded-xl mt-6">
      <h1 className="text-2xl font-semibold mb-4">Add Brand</h1>

      <form onSubmit={handleAddBrand} className="space-y-4">
        {/* Brand Name */}
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-medium text-gray-700">
            Brand Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={brand.name}
            onChange={(e) => setBrand({ name: e.target.value })}
            className="p-2 border border-gray-300 rounded-md text-sm focus:outline-none 
            focus:ring-2 focus:ring-[#aec958] transition"
            placeholder="Enter brand name"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#4998d1] hover:bg-[#3b7aa8] text-white font-semibold py-3 
          rounded-md transition"
        >
          {loading ? "Adding..." : "Add Brand"}
        </button>
      </form>

      {/* Back */}
      <button
        onClick={() => router.push("/admin/brands")}
        className="mt-4 w-full text-center text-sm text-[#aec958] font-semibold hover:underline cursor-pointer"
      >
        ← Back to Brand List
      </button>

      <ToastContainer />
    </div>
  );
}
