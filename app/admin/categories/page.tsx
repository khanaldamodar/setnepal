"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CRUDTable from "@/components/admin-components/CRUDTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

interface CategoryType {
  id: number;
  name: string;
}

const page = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch category");
        const data: CategoryType[] = await res.json();
        setCategories(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) return <div className="p-6 text-lg">Loading categories...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="h-screen">
      {/* header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <Link href="/admin/categories/add">
          <Button className="flex items-center gap-2">
            <Plus size={18} /> Add Category
          </Button>
        </Link>
      </div>

      <div className="flex-1 p-4">
        {categories.length > 0 ? (
          <CRUDTable
            endpoint="categories"
            columns={["name"]}
            data={categories}
            setData={setCategories}
          />
        ) : (
          <div className="text-center text-gray-400 mt-10">
            No Categories found.
          </div>
        )}
      </div>
    </div>
  );
};

export default page;
