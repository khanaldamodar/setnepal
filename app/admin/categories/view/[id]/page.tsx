"use client";

import { useParams, useRouter } from "next/navigation";
import { useFetch } from "@/services/useFetch";
import { useState, useMemo } from "react";

interface ProductType {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  isFeatured: boolean;
  isActive: boolean;
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

  // State ALWAYS at top → no Hook violation
  const [page, setPage] = useState(1);
  const perPage = 20;

  const {
    data: categories,
    loading,
    error,
  } = useFetch<CategoryType[]>("categories");

  const category = categories?.find((b) => b.id === categoryId);

  // Memoized pagination
  const totalPages = useMemo(() => {
    if (!category?.products) return 0;
    return Math.ceil(category.products.length / perPage);
  }, [category]);

  const paginatedProducts = useMemo(() => {
    if (!category?.products) return [];
    const start = (page - 1) * perPage;
    return category.products.slice(start, start + perPage);
  }, [category, page]);

  // Return screens — AFTER all hooks
  if (loading) return <div className="p-5">Loading...</div>;
  if (error) return <div className="p-5 text-red-500">{error.message}</div>;
  if (!category)
    return <div className="p-5 text-red-500">Category not found!</div>;

  return (
    <div className="p-6 bg-white rounded-xl shadow border">
      <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
      {/* <p className="text-gray-600 mb-6">Category ID: {category.id}</p> */}

      <h2 className="text-lg text-gray-700 mb-3">Products in this Category</h2>

      {category.products.length === 0 ? (
        <div className="p-4 text-gray-500 border rounded bg-gray-50">
          No products found in this category.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border rounded-xl overflow-hidden">
              <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
                <tr>
                  <th className="border px-4 py-2 text-left">Name</th>
                  <th className="border px-4 py-2 text-left">Description</th>
                  <th className="border px-4 py-2 text-left">Price</th>
                  <th className="border px-4 py-2 text-left">Stock</th>
                  <th className="border px-4 py-2 text-left">Featured</th>
                  <th className="border px-4 py-2 text-left">Active</th>
                </tr>
              </thead>

              <tbody>
                {paginatedProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{p.name}</td>
                    <td className="border px-4 py-2">{p.description || "—"}</td>
                    <td className="border px-4 py-2">Rs. {p.price}</td>
                    <td className="border px-4 py-2">{p.stock}</td>
                    <td className="border px-4 py-2">
                      {p.isFeatured ? (
                        <span className="text-green-600 font-semibold">
                          Yes
                        </span>
                      ) : (
                        <span className="text-red-500">No</span>
                      )}
                    </td>
                    <td className="border px-4 py-2">
                      {p.isActive ? (
                        <span className="text-green-600 font-semibold">
                          Active
                        </span>
                      ) : (
                        <span className="text-red-500">Inactive</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-end items-center gap-3 mt-4">
              <button
                className="px-4 py-2 border rounded disabled:opacity-50"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Prev
              </button>

              <span className="text-gray-600">
                Page {page} of {totalPages}
              </span>

              <button
                className="px-4 py-2 border rounded disabled:opacity-50"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <button
        className="mt-6 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
        onClick={() => router.back()}
      >
        Go Back
      </button>
    </div>
  );
}
