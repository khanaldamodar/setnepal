"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { ADToBS, BSToAD } from "bikram-sambat-js";
import { NepaliDatePicker } from "@kkeshavv18/nepali-datepicker";
import "@kkeshavv18/nepali-datepicker/dist/index.css";
import { ChevronDown, ChevronUp } from "lucide-react";
import Pagination from "@/components/global/Pagination";

interface FollowUp {
  id: number;
  scheduledAt: string;
  status: "PENDING" | "COMPLETED" | "MISSED";
  notes?: string;
  customer: {
    organization_name: string;
  };
  createdBy?: {
    name: string;
  };
  createdById?: number;
}

export default function AllFollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const todayBS = ADToBS(new Date());
  const [fromDate, setFromDate] = useState<string>(todayBS);
  const [toDate, setToDate] = useState<string>(todayBS);

  const [createdById, setCreatedById] = useState<string>("");
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const fetchFollowUps = async (applyFilter = false) => {
    setLoading(true);
    setError(null);

    const token = Cookies.get("token");
    if (!token) {
      setError("Unauthorized: No token found");
      setLoading(false);
      return;
    }

    try {
      let query = "";

      if (applyFilter) {
        setCurrentPage(1); // reset page on filter

        if (fromDate) {
          const isoFrom = new Date(BSToAD(fromDate)).toISOString();
          query += `from=${encodeURIComponent(isoFrom)}&`;
        }

        if (toDate) {
          const adTo = new Date(BSToAD(toDate));
          adTo.setHours(23, 59, 59, 999);
          const isoTo = adTo.toISOString();
          query += `to=${encodeURIComponent(isoTo)}&`;
        }

        if (createdById) {
          query += `createdById=${createdById}&`;
        }
      }

      const res = await fetch(`/api/follow-ups?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch follow-ups");

      const data: FollowUp[] = await res.json();
      setFollowUps(data);

      // Extract users for dropdown
      const uniqueUsers = Array.from(
        new Map(
          data
            .filter((fu) => fu.createdBy && fu.createdById)
            .map((fu) => [
              fu.createdById!,
              { id: fu.createdById!, name: fu.createdBy!.name },
            ]),
        ).values(),
      );
      setUsers(uniqueUsers);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setFollowUps([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps(false);
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatToNepali = (iso: string | undefined) => {
    if (!iso) return "—";
    const date = new Date(iso);
    const bsDate = ADToBS(date);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${bsDate} ${hours}:${minutes}`;
  };

  // Pagination
  const startIndex = (currentPage - 1) * perPage;
  const paginatedData = followUps.slice(startIndex, startIndex + perPage);

  if (loading) return <div className="p-4">Loading follow-ups...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6 bg-white shadow rounded-xl space-y-3">
      <h1 className="text-lg sm:text-2xl font-semibold mb-4">All Follow-Ups</h1>

      {/* Total count */}
      <div className="text-sm sm:text-base text-gray-600 mb-2">
        Total Follow-Ups: {followUps.length}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-end gap-3 mb-4 p-3 bg-gray-50 rounded-md shadow-sm">
        <div className="flex flex-col w-full sm:w-auto">
          <label className="text-xs text-gray-500 mb-1">From</label>
          <NepaliDatePicker
            initialDate={fromDate || null}
            onDateChange={setFromDate}
          />
        </div>

        <div className="flex flex-col w-full sm:w-auto">
          <label className="text-xs text-gray-500 mb-1">To</label>
          <NepaliDatePicker
            initialDate={toDate || null}
            onDateChange={setToDate}
          />
        </div>

        <div className="flex flex-col w-full sm:w-auto">
          <label className="text-xs text-gray-500 mb-1">Created By</label>
          <select
            value={createdById}
            onChange={(e) => setCreatedById(e.target.value)}
            className="w-full sm:w-auto border rounded px-2 py-1"
          >
            <option value="">All Creators</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => fetchFollowUps(true)}
            className="w-full sm:w-auto bg-[#99b84f] text-white px-4 py-2 sm:py-1 rounded"
          >
            Filter
          </button>

          <button
            onClick={() => {
              const todayBS = ADToBS(new Date());
              setFromDate(todayBS);
              setToDate(todayBS);
              setCreatedById("");
              fetchFollowUps(false);
            }}
            className="w-full sm:w-auto bg-gray-300 text-gray-800 px-4 py-2 sm:py-1 rounded"
          >
            Reset
          </button>
        </div>
      </div>

      {/* List */}
      {followUps.length === 0 ? (
        <p>No follow-ups found.</p>
      ) : (
        <>
          {paginatedData.map((fu) => {
            const isExpanded = expandedId === fu.id;
            return (
              <div
                key={fu.id}
                onClick={() => toggleExpand(fu.id)}
                className="border p-2 sm:p-4 rounded-md flex flex-col cursor-pointer hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm sm:text-xl font-semibold">
                      {fu.customer.organization_name}
                    </p>
                    <p className="text-[10px] sm:text-sm text-gray-500">
                      {formatToNepali(fu.scheduledAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${
                        fu.status === "PENDING"
                          ? "bg-yellow-500 text-white"
                          : fu.status === "COMPLETED"
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                      }`}
                    >
                      {fu.status}
                    </span>
                    <span className="text-sm sm:text-lg">
                      {isExpanded ? <ChevronUp /> : <ChevronDown />}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-2 space-y-1 text-xs sm:text-sm pl-1 sm:pl-2">
                    <p className="leading-tight">
                      <strong>Created By:</strong> {fu.createdBy?.name || "—"}
                    </p>
                    <p className="leading-tight">
                      <strong>Notes:</strong> {fu.notes || "—"}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Pagination only if total > perPage */}
          {followUps.length > perPage && (
            <Pagination
              total={followUps.length}
              perPage={perPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
