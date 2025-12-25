"use client";

import { ProductFilters } from "@/components/Productpage-components/product-filters";
import { ProductGrid } from "@/components/Productpage-components/product-grid";
import { ProductPagination } from "@/components/Productpage-components/product-pagination";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const ITEMS_PER_PAGE = 6;

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<{
    categories: string[];
    brands: string[];
    priceRange: [number, number];
    minRating: number;
  }>({
    categories: [],
    brands: [],
    priceRange: [0, 1000000],
    minRating: 0,
  });

  const searchParams = useSearchParams();

  useEffect(() => {
    const search = searchParams.get("search") || "";
    setSearchQuery(search);
    setCurrentPage(1);
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    return products.filter((product: any) => {
      const categoryMatch =
        filters.categories.length === 0 ||
        filters.categories.includes(product.categoryName);

      const brandMatch =
        filters.brands.length === 0 ||
        filters.brands.includes(product.brandName);

      const priceMatch =
        product.price >= filters.priceRange[0] &&
        product.price <= filters.priceRange[1];

      const ratingMatch = product.rating >= filters.minRating;

      const searchMatch =
        searchQuery === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase());

      return (
        categoryMatch && brandMatch && priceMatch && ratingMatch && searchMatch
      );
    });
  }, [filters, products, searchQuery]);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch("/api/products");
      const data = await res.json();

      const flattened = data.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        rating: Number(p.rating) || 0,

        category: p.category
          ? [
              {
                id: p.category.id || 0,
                name: p.category.name || p.category || "Unknown",
              },
            ]
          : [],

        imageUrl: p.image || p.imageUrl || "/placeholder.svg",

        categoryName: p.category?.name || p.category || "Unknown",
        brandName: p.brand?.name || "Unknown",
      }));

      setProducts(flattened);
    };

    fetchProducts();
  }, []);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const endIndex = currentPage * ITEMS_PER_PAGE;
    return filteredProducts.slice(0, endIndex);
  }, [filteredProducts, currentPage]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <main className="min-h-screen font-poppins py-30 md:py-30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center gap-2">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 rounded border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          />

          <button
            onClick={() => setCurrentPage(1)} // Reset page on search
            className="rounded bg-primary px-4 py-2 hover:bg-primary/90 bg-white"
          >
            Search
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="mt-2 text-muted-foreground">
            Browse our collection of {filteredProducts.length} products
          </p>
        </div>

        {/* Main Content */}
        <div className="flex gap-8 flex-col md:flex-row">
          {/* Sidebar Filters */}
          <aside className="w-full shrink-0 md:w-64">
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </aside>

          {/* Products Section */}
          <div className="flex-1">
            {paginatedProducts.length > 0 ? (
              <>
                <ProductGrid products={paginatedProducts} />
                <div className="mt-8">
                  <ProductPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            ) : (
              <div className="flex h-96 items-center justify-center rounded-lg border border-border bg-card">
                <div className="text-center">
                  <p className="text-lg font-medium text-foreground">
                    No products found
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Try adjusting your filters
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
