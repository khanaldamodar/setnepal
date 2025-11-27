"use client";

import { useParams, useRouter } from "next/navigation";
import { useFetch } from "@/services/useFetch";

interface ProductType {
  id: number;
  name: string;
}

interface CategoryType {
  id: number;
  name: string;
  products: ProductType[];
}

export default function ViewCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = Number(params?.id);

  const {
    data: categories,
    loading,
    error,
  } = useFetch<CategoryType[]>("categories");

  if (loading) return <div className="p-5">Loading...</div>;
  if (error) return <div className="p-5 text-red-500">{error.message}</div>;

  const category = categories?.find((b) => b.id === categoryId);

  if (!category)
    return <div className="p-5 text-red-500">Category not found!</div>;

  return (
    <div className="p-6 w-8/10 mx-2 bg-green-100 rounded shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Category Details</h1>
      <p>
        <strong>ID:</strong> {category.id}
      </p>
      <p>
        <strong>Name:</strong> {category.name}
      </p>
      <p>
        <strong>Products:</strong>{" "}
        {category.products?.length
          ? category.products.map((p) => p.name).join(", ")
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
