"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { usePost } from "@/services/usePost";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface CategoryType {
  name: string;
}

export default function AddCategoryPage() {
  const router = useRouter();
  const [category, setCategory] = useState<CategoryType>({ name: "" });

  const { postData, loading, error } = usePost<CategoryType>("/api/categories");

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get("token");

    try {
      await postData(category, token);
      toast.success("Category added successfully!");
      setCategory({ name: "" });
    } catch (err) {
      console.error(err);
      toast.error(error?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 shadow rounded-xl mt-6">
      <h1 className="text-2xl font-semibold mb-4">Add Category</h1>

      <form onSubmit={handleAddCategory} className="space-y-4">
        {/* Category Name */}
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-medium text-gray-700">
            Category Name
          </label>

          <input
            type="text"
            id="name"
            name="name"
            required
            value={category.name}
            onChange={(e) => setCategory({ name: e.target.value })}
            placeholder="Enter category name"
            className="p-2 border border-gray-300 rounded-md text-sm
            focus:outline-none focus:ring-2 focus:ring-[#aec958] transition"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#aec958] hover:bg-[#99b84f] text-white 
          font-semibold py-3 rounded-md transition"
        >
          {loading ? "Adding..." : "Add Category"}
        </button>
      </form>

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="mt-4 w-full text-center text-sm text-[#4998d1] font-semibold hover:underline cursor-pointer"
      >
        ← Back to Dashboard
      </button>
    </div>
  );
}
