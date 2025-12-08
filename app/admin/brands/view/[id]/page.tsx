"use client";

import { useParams, useRouter } from "next/navigation";
import { useFetch } from "@/services/useFetch";
import { useState, useMemo } from "react";

interface ProductType {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  isFeatured: boolean;
  isActive: boolean;
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

  const [page, setPage] = useState(1);
  const perPage = 20;

  const { data: brands, loading, error } = useFetch<BrandType[]>("brands");

  const brand = brands?.find((b) => b.id === brandId);

  const totalPages = useMemo(() => {
    return brand?.products ? Math.ceil(brand.products.length / perPage) : 0;
  }, [brand]);

  const paginatedProducts = useMemo(() => {
    if (!brand?.products) return [];
    const start = (page - 1) * perPage;
    return brand.products.slice(start, start + perPage);
  }, [brand, page]);

  // Loading states
  if (loading) return <div className="p-5">Loading...</div>;
  if (error) return <div className="p-5 text-red-500">{error.message}</div>;
  if (!brand) return <div className="p-5 text-red-500">Brand not found!</div>;

  return (
    <div className="p-6 bg-white rounded-xl shadow border font-poppins">
      {/* BRAND HEADER */}
      <h1 className="text-3xl font-bold mb-2">{brand.name}</h1>
      {/* <p className="text-gray-600 mb-6">Brand ID: {brand.id}</p> */}

      <h2 className="text-lg text-gray-700 mb-3">Products</h2>

      {/* NO PRODUCTS */}
      {brand.products.length === 0 ? (
        <div className="p-4 text-gray-500 border rounded-lg bg-gray-50">
          No products found for this brand.
        </div>
      ) : (
        <>
          {/* PRODUCTS TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border rounded-xl overflow-hidden">
              <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
                <tr>
                  <th className="border px-4 py-2 text-left">Name</th>
                  <th className="border px-4 py-2 text-left">Description</th>
                  <th className="border px-4 py-2 text-left">Price</th>
                  <th className="border px-4 py-2 text-left">Stock</th>
                  <th className="border px-4 py-2 text-left">Featured?</th>
                  <th className="border px-4 py-2 text-left">Active?</th>
                </tr>
              </thead>

              <tbody>
                {paginatedProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{p.name}</td>
                    <td className="border px-4 py-2">{p.description}</td>
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

      {/* BACK BUTTON */}
      <button
        className="mt-6 bg-yellow-400 px-5 py-2 rounded hover:bg-yellow-500"
        onClick={() => router.back()}
      >
        Go Back
      </button>
    </div>
  );
}
