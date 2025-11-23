"use client";

import { PackageFilters } from "@/components/package-components/package-filter";
import { PackageGrid } from "@/components/package-components/package-grid";
import { ProductPagination } from "@/components/Productpage-components/product-pagination";
import { useState, useMemo } from "react";

// Sample package data
const SAMPLE_PACKAGES = [
  {
    id: 1,
    name: "Home Office Starter",
    description: "Perfect for beginners setting up a home office",
    price: 299.99,
    originalPrice: 399.99,
    category: "Office Setup",
    rating: 4.6,
    image: "/home-office-starter-bundle.jpg",
    productCount: 5,
    products: [
      { id: 1, name: "Wireless Headphones", price: 129.99 },
      { id: 3, name: "Laptop Stand", price: 49.99 },
      { id: 5, name: "Mouse Pad", price: 24.99 },
      { id: 7, name: "Desk Lamp", price: 39.99 },
      { id: 9, name: "Phone Stand", price: 14.99 },
    ],
  },
  {
    id: 2,
    name: "Professional Setup",
    description: "Complete professional workstation package",
    price: 599.99,
    originalPrice: 799.99,
    category: "Professional",
    rating: 4.8,
    image: "/professional-workstation-setup.jpg",
    productCount: 7,
    products: [
      { id: 1, name: "Wireless Headphones", price: 129.99 },
      { id: 4, name: "Mechanical Keyboard", price: 159.99 },
      { id: 6, name: "Monitor Arm", price: 79.99 },
      { id: 8, name: "Wireless Mouse", price: 34.99 },
      { id: 11, name: "Webcam", price: 89.99 },
      { id: 2, name: "USB-C Cable", price: 19.99 },
      { id: 10, name: "USB Hub", price: 44.99 },
    ],
  },
  {
    id: 3,
    name: "Desk Essentials",
    description: "Must-have items for any desk",
    price: 149.99,
    originalPrice: 199.99,
    category: "Accessories",
    rating: 4.4,
    image: "/desk-essentials-collection.jpg",
    productCount: 4,
    products: [
      { id: 5, name: "Mouse Pad", price: 24.99 },
      { id: 7, name: "Desk Lamp", price: 39.99 },
      { id: 12, name: "Desk Organizer", price: 29.99 },
      { id: 9, name: "Phone Stand", price: 14.99 },
    ],
  },
  {
    id: 4,
    name: "Cable & Connectivity",
    description: "All cables and connectivity solutions",
    price: 99.99,
    originalPrice: 149.99,
    category: "Accessories",
    rating: 4.5,
    image: "/cables-connectivity-bundle.jpg",
    productCount: 3,
    products: [
      { id: 2, name: "USB-C Cable", price: 19.99 },
      { id: 10, name: "USB Hub", price: 44.99 },
      { id: 9, name: "Phone Stand", price: 14.99 },
    ],
  },
  {
    id: 5,
    name: "Gaming Setup",
    description: "Everything you need for gaming",
    price: 449.99,
    originalPrice: 599.99,
    category: "Gaming",
    rating: 4.7,
    image: "/gaming-setup-bundle.jpg",
    productCount: 5,
    products: [
      { id: 1, name: "Wireless Headphones", price: 129.99 },
      { id: 4, name: "Mechanical Keyboard", price: 159.99 },
      { id: 8, name: "Wireless Mouse", price: 34.99 },
      { id: 5, name: "Mouse Pad", price: 24.99 },
      { id: 6, name: "Monitor Arm", price: 79.99 },
    ],
  },
  {
    id: 6,
    name: "Streaming Bundle",
    description: "Complete streaming setup for content creators",
    price: 699.99,
    originalPrice: 899.99,
    category: "Professional",
    rating: 4.9,
    image: "/streaming-setup-bundle.jpg",
    productCount: 6,
    products: [
      { id: 1, name: "Wireless Headphones", price: 129.99 },
      { id: 11, name: "Webcam", price: 89.99 },
      { id: 4, name: "Mechanical Keyboard", price: 159.99 },
      { id: 8, name: "Wireless Mouse", price: 34.99 },
      { id: 7, name: "Desk Lamp", price: 39.99 },
      { id: 2, name: "USB-C Cable", price: 19.99 },
    ],
  },
];

const ITEMS_PER_PAGE = 6;

export default function PackagesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: [0, 100000],
    minRating: 0,
  });

  // Filter packages based on selected filters
  const filteredPackages = useMemo(() => {
    return SAMPLE_PACKAGES.filter((pkg) => {
      const categoryMatch =
        filters.categories.length === 0 ||
        filters.categories.includes(pkg.category);
      const priceMatch =
        pkg.price >= filters.priceRange[0] &&
        pkg.price <= filters.priceRange[1];
      const ratingMatch = pkg.rating >= filters.minRating;

      return categoryMatch && priceMatch && ratingMatch;
    });
  }, [filters]);

  // Paginate filtered packages
  const totalPages = Math.ceil(filteredPackages.length / ITEMS_PER_PAGE);
  const paginatedPackages = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPackages.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPackages, currentPage]);

  // Reset to page 1 when filters change
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <main className="min-h-screen font-poppins">
      <div className="mx-auto max-w-7xl px-4 py-30 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Packages</h1>
          <p className="mt-2 text-muted-foreground">
            Curated bundles of {filteredPackages.length} packages to save you
            money
          </p>
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
            {paginatedPackages.length > 0 ? (
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
