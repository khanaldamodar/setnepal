"use client";

import { useParams, useRouter } from "next/navigation";
import { useFetch } from "@/services/useFetch";

interface ProductType {
  id: number;
  name: string;
}

interface BrandType {
  id: number;
  name: string;
  products: ProductType[];
}

export default function ViewBrandPage() {
  const params = useParams();
  const router = useRouter();
  const brandId = Number(params?.id);

  // Fetch all brands
  const { data: brands, loading, error } = useFetch<BrandType[]>("brands");

  if (loading) return <div className="p-5">Loading...</div>;
  if (error) return <div className="p-5 text-red-500">{error.message}</div>;

  // Find the brand by ID
  const brand = brands?.find((b) => b.id === brandId);

  if (!brand) return <div className="p-5 text-red-500">Brand not found!</div>;

  return (
    <div className="p-6 w-full bg-green-100 rounded shadow-lg font-poppins">
      <h1 className="text-2xl font-bold mb-4">Brand Details</h1>
      <p>
        <strong>ID:</strong> {brand.id}
      </p>
      <p>
        <strong>Name:</strong> {brand.name}
      </p>
      <p>
        <strong>Products:</strong>{" "}
        {brand.products?.length
          ? brand.products.map((p) => p.name).join(", ")
          : "No products"}
      </p>

      <button
        className="mt-4 bg-yellow-400 px-4 py-2 rounded cursor-pointer"
        onClick={() => router.back()}
      >
        Go Back
      </button>
    </div>
  );
}
