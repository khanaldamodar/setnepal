"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUpdate } from "@/services/useUpdate";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface CategoryType {
  id: number;
  name: string;
}

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = Number(params?.id);

  const [category, setCategory] = useState<CategoryType | null>(null);
  const [name, setName] = useState("");

  const {
    updateData,
    loading: updating,
    error: updateError,
  } = useUpdate<CategoryType>();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch("/api/categories");
        const data: CategoryType[] = await res.json();
        const found = data.find((c) => c.id === categoryId);
        if (found) {
          setCategory(found);
          setName(found.name);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategory();
  }, [categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;

    const result = await updateData(
      `categories/${category.id}`,
      { ...category, name },
      "PUT"
    );

    if (result) {
      toast.success("Category updated successfully!");
      router.push("/admin/categories");
    }
  };

  if (!category)
    return (
      <div className="p-6 text-black text-center text-xl">
        Loading category...
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 shadow rounded-xl mt-6">
      <h1 className="text-2xl font-semibold mb-4">Edit Category</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Name */}
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-medium text-gray-700">
            Category Name
          </label>

          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="p-2 border border-gray-300 rounded-md text-sm
            focus:outline-none focus:ring-2 focus:ring-[#aec958] transition"
            placeholder="Enter category name"
          />
        </div>

        {/* Error Message */}
        {updateError && <p className="text-red-500 text-sm">{updateError}</p>}

        {/* Update Button */}
        <button
          type="submit"
          disabled={updating}
          className="w-full bg-[#4998d1] hover:bg-[#3b7aa8] text-white 
          font-semibold py-3 rounded-md transition"
        >
          {updating ? "Updating..." : "Update Category"}
        </button>
      </form>

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="mt-4 w-full text-center text-sm text-[#4998d1] font-semibold hover:underline cursor-pointer"
      >
        ← Back to Categories
      </button>
    </div>
  );
}
