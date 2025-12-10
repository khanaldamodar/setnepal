"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";

const MobileSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="relative w-full max-w-100 mt-4  lg:hidden flex items-center gap-4"
    >
      <input
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="rounded-md border text-black border-gray-300 w-full py-4 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button
        className="absolute right-0 top-0 mr-1 text-white px-2 py-2 my-2 rounded bg-primary hover:bg-primary/80"
        onClick={handleSearch}
      >
        <FiSearch />
      </button>
    </form>
  );
};

export default MobileSearch;
