"use client";

import React from "react";

interface PaginationProps {
  total: number;
  perPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  total,
  perPage,
  currentPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="flex justify-center items-center mt-6 gap-2">
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
        disabled={currentPage === 1}
      >
        Prev
      </button>
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i + 1)}
          className={`px-3 py-1 rounded-md ${
            currentPage === i + 1
              ? "bg-[#99b84f] text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          {i + 1}
        </button>
      ))}
      <button
        onClick={() =>
          currentPage < totalPages && onPageChange(currentPage + 1)
        }
        className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
