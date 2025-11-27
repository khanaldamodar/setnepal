"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUpdate } from "@/services/useUpdate";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface BrandType {
  id: number;
  name: string;
}

export default function EditBrandPage() {
  const params = useParams();
  const router = useRouter();
  const brandId = Number(params?.id);

  const [brand, setBrand] = useState<BrandType | null>(null);
  const [name, setName] = useState("");

  const {
    updateData,
    loading: updating,
    error: updateError,
  } = useUpdate<BrandType>();

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const res = await fetch("/api/brands");
        const data: BrandType[] = await res.json();
        const matchingBrand = data.find((b) => b.id === brandId);
        if (matchingBrand) {
          setBrand(matchingBrand);
          setName(matchingBrand.name);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchBrand();
  }, [brandId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand) return;

    const updateBrand = { ...brand, name };
    const result = await updateData(`brands/${brandId}`, updateBrand, "PUT");

    if (result) {
      toast.success("Brand updated successfully!");
      router.push("/admin/brands");
    }
  };

  if (!brand) {
    return (
      <div className="p-6 text-black text-center text-xl">Loading brand...</div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 shadow rounded-xl mt-6">
      <h1 className="text-2xl font-semibold mb-4">Edit Brand</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Brand Name */}
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-medium text-gray-700">
            Brand Name
          </label>

          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter brand name"
            className="p-2 border border-gray-300 rounded-md text-sm
            focus:outline-none focus:ring-2 focus:ring-[#aec958] transition"
          />
        </div>

        {/* Error */}
        {updateError && <p className="text-red-500 text-sm">{updateError}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={updating}
          className="w-full bg-[#4998d1] hover:bg-[#3b7aa8] text-white 
          font-semibold py-3 rounded-md transition"
        >
          {updating ? "Updating..." : "Update Brand"}
        </button>
      </form>

      {/* Back */}
      <button
        onClick={() => router.push("/admin/brands")}
        className="mt-4 w-full text-center text-sm text-[#aec958] font-semibold hover:underline cursor-pointer"
      >
        ← Back to Brand List
      </button>
    </div>
  );
}
