"use client";

import { PackageFilters } from "@/components/package-components/package-filter";
import { PackageGrid } from "@/components/package-components/package-grid";
import { ProductPagination } from "@/components/Productpage-components/product-pagination";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";

const ITEMS_PER_PAGE = 6;

interface Package {
  id: number;
  name: string;
  description: string;
  price: number;
  discount?: number;
  stock: number;
  imageUrl: string | null;
  category?: { id: number; name: string };
}

export default function PackagesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const search = searchParams.get("search") || "";
    setSearchQuery(search);
    setCurrentPage(1);
  }, [searchParams]);
  const [filters, setFilters] = useState<{
    categories: string[];
    priceRange: [number, number];
    minRating: number;
  }>({
    categories: [],
    priceRange: [0, 100000],
    minRating: 0,
  });

  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch packages from API
  useEffect(() => {
    async function fetchPackages() {
      try {
        const res = await fetch("/api/packages");
        if (!res.ok) throw new Error("Failed to fetch packages");
        const data: Package[] = await res.json();
        setPackages(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPackages();
  }, []);

  // Filter packages based on selected filters
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const categoryMatch =
        filters.categories.length === 0 ||
        filters.categories.includes(pkg.category?.name ?? "");

      const priceMatch =
        pkg.price >= filters.priceRange[0] &&
        pkg.price <= filters.priceRange[1];

      const searchMatch =
        searchQuery === "" ||
        pkg.name.toLowerCase().includes(searchQuery.toLowerCase());

      return categoryMatch && priceMatch && searchMatch;
    });
  }, [filters, packages, searchQuery]);

  // Paginate filtered packages
  const totalPages = Math.ceil(filteredPackages.length / ITEMS_PER_PAGE);
  const paginatedPackages = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPackages.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPackages, currentPage]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <main className="min-h-screen font-poppins">
      <div className="mx-auto max-w-7xl px-4 py-30 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Packages</h1>
          <p className="mt-2 text-muted-foreground">
            Curated bundles of {filteredPackages.length} packages to save you
            money
          </p>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <input
            type="text"
            placeholder="Search packages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 rounded border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          />
          <button
            onClick={() => setCurrentPage(1)}
            className="rounded bg-primary px-4 py-2 hover:bg-primary/90 text-white"
          >
            Search
          </button>
        </div>

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full shrink-0 md:w-64">
            <PackageFilters
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </aside>

          {/* Packages Section */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-10 text-muted-foreground">
                Loading packages...
              </div>
            ) : paginatedPackages.length > 0 ? (
              <>
                <PackageGrid packages={paginatedPackages} />
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
                    No packages found
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
