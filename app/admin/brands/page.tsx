"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CRUDTable from "@/components/admin-components/CRUDTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
interface BrandType {
  id: number;
  name: string;
}


const BrandsPage = () => {
  const router = useRouter();
  const [brands, setBrands] = useState<BrandType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch("/api/brands");
        if (!res.ok) throw new Error("Failed to fetch brands");
        const data: BrandType[] = await res.json();
        setBrands(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  if (loading) return <div className="p-6 text-lg">Loading brands...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="h-screen flex flex-col font-poppins">
      {/* header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Brands</h1>
        <Link href="/admin/brands/add">
          <Button className="flex items-center gap-2">
            <Plus size={18} /> Add Brands
          </Button>
        </Link>
      </div>

      {/* main content */}
      <div className="flex-1 p-4 w-full">
        {brands.length > 0 ? (
          <CRUDTable
            endpoint="brands"
            columns={["name"]}
            data={brands}
            setData={setBrands}
          />
        ) : (
          <div className="text-center text-gray-400 mt-10">
            No brands found.
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandsPage;
