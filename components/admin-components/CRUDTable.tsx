"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Edit, Eye, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useDelete } from "@/services/useDelete";
import clsx from "clsx";

interface CRUDTableProps {
  endpoint: string; // for frontend routes
  apiEndpoint?: string; // for backend API (optional)
  columns: string[];
  data: any[];
  setData: React.Dispatch<React.SetStateAction<any[]>>;
  actions?: ("view" | "edit" | "delete")[];
  renderCell?: (column: string, row: any) => React.ReactNode;
}

export default function CRUDTable({
  endpoint,
  apiEndpoint,
  columns,
  data,
  setData,
  actions = ["view", "edit", "delete"],
  renderCell,
}: CRUDTableProps) {
  const router = useRouter();
  const { deleteItem, loading: deleting } = useDelete(
    data,
    setData,
    `/api/${apiEndpoint || endpoint}` // use apiEndpoint if provided
  );

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 8;

  // Filtered
  const filtered = useMemo(() => {
    const lower = search.toLowerCase();
    return data.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(lower)
      )
    );
  }, [data, search]);

  // Sorted
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const valA = String(a[sortKey]);
      const valB = String(b[sortKey]);
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }, [filtered, sortKey, sortAsc]);

  // Paginated
  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return sorted.slice(start, start + perPage);
  }, [sorted, page]);

  const totalPages = Math.ceil(filtered.length / perPage);

  const renderSafeCell = (col: string, row: any) => {
    if (renderCell) return renderCell(col, row);

    const value = row[col];

    if (Array.isArray(value)) {
      if (endpoint === "gallery") {
        return (
          <div className="flex gap-2">
            {value.slice(0, 1).map((img: any, idx: number) => (
              <img
                key={idx}
                src={img.url || img}
                alt={img.name || `image-${idx}`}
                className="w-16 h-16 object-cover rounded-md border"
              />
            ))}
            {value.length > 1 && (
              <span className="text-sm text-gray-500 flex items-center">
                +{value.length - 1} more
              </span>
            )}
          </div>
        );
      } else {
        return value
          .map((v: any) => (typeof v === "object" ? JSON.stringify(v) : v))
          .join(", ");
      }
    }

    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value);
    }

    return value;
  };

  return (
    <Card className="shadow-md border rounded-2xl overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <CardTitle className="text-xl font-semibold capitalize">
          {endpoint} Table
        </CardTitle>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent className="overflow-x-auto">
        <motion.table
          className="w-full text-left border-collapse"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <thead className="bg-gray-100 dark:bg-gray-800 text-sm uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3 text-center w-16">SN</th>
              {columns.map((col) => (
                <th
                  key={col}
                  onClick={() => {
                    if (sortKey === col) setSortAsc(!sortAsc);
                    else {
                      setSortKey(col);
                      setSortAsc(true);
                    }
                  }}
                  className="px-4 py-3 cursor-pointer select-none hover:text-primary transition-colors"
                >
                  {col}
                  {sortKey === col && (
                    <span className="ml-1">{sortAsc ? "▲" : "▼"}</span>
                  )}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-4 py-3 text-center w-52">Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            {paginated.length > 0 ? (
              paginated.map((item, index) => (
                <motion.tr
                  key={item.id}
                  className={clsx(
                    "border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
                  )}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <td className="px-4 py-3 text-center text-sm">
                    {(page - 1) * perPage + index + 1}
                  </td>

                  {columns.map((col) => (
                    <td key={col} className="px-4 py-3 text-sm align-top">
                      {renderSafeCell(col, item)}
                    </td>
                  ))}

                  {actions.length > 0 && (
                    <td className="px-4 py-3 text-center flex justify-center gap-2">
                      {actions.includes("view") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            router.push(`/admin/${endpoint}/view/${item.id}`)
                          }
                          className="hover:text-blue-600 cursor-pointer"
                        >
                          <Eye size={18} />
                        </Button>
                      )}

                      {actions.includes("edit") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            router.push(`/admin/${endpoint}/edit/${item.id}`)
                          }
                          className="hover:text-green-600 cursor-pointer"
                        >
                          <Edit size={18} />
                        </Button>
                      )}

                      {actions.includes("delete") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteItem(item.id)}
                          disabled={deleting}
                          className="hover:text-red-600 text-red-800 cursor-pointer"
                        >
                          <Trash2 size={18} />
                        </Button>
                      )}
                    </td>
                  )}
                </motion.tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (actions.length > 0 ? 2 : 1)}
                  className="text-center py-6 text-gray-500"
                >
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </motion.table>

        {totalPages > 1 && (
          <div className="flex justify-end items-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </Button>
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
