"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { ADToBS, BSToAD } from "bikram-sambat-js";
import { NepaliDatePicker } from "@kkeshavv18/nepali-datepicker";
import "@kkeshavv18/nepali-datepicker/dist/index.css";
import { ChevronDown, ChevronUp } from "lucide-react";
import Pagination from "@/components/global/Pagination";

interface CallLog {
  id: number;
  callTime: string;
  callStatus: string;
  response: string;
  notes: string;
  customer: {
    organization_name: string;
  };
  calledBy?: {
    id: number;
    name: string;
  };
  calledById?: number;
}

export default function AllCallLogsPage() {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);

  // Pagination
  const perPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Date pickers default to today
  const todayBS = ADToBS(new Date());
  const [fromDate, setFromDate] = useState<string>(todayBS);
  const [toDate, setToDate] = useState<string>(todayBS);
  const [createdById, setCreatedById] = useState<string>("");

  // Users dropdown
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);

  const fetchCallLogs = async (applyFilter = false) => {
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
        setCurrentPage(1); // Reset to first page on filter

        if (fromDate) {
          const isoFrom = new Date(BSToAD(fromDate)).toISOString();
          query += `from=${encodeURIComponent(isoFrom)}&`;
        }

        if (toDate) {
          const adTo = new Date(BSToAD(toDate));
          adTo.setHours(23, 59, 59, 999);
          query += `to=${encodeURIComponent(adTo.toISOString())}&`;
        }

        if (createdById) query += `createdById=${createdById}&`;
      }

      const res = await fetch(`/api/call-logs?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch call logs");

      const data: CallLog[] = await res.json();
      setCallLogs(data);

      // Extract unique users
      const uniqueUsers = Array.from(
        new Map(
          data
            .filter((log) => log.calledBy && log.calledById)
            .map((log) => [
              log.calledBy!.id,
              { id: log.calledById!, name: log.calledBy!.name },
            ]),
        ).values(),
      );
      setUsers(uniqueUsers);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setCallLogs([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCallLogs(false);
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedLogId(expandedLogId === id ? null : id);
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
  const startIdx = (currentPage - 1) * perPage;
  const paginatedLogs = callLogs.slice(startIdx, startIdx + perPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) return <div className="p-4 sm:p-6">Loading call logs...</div>;
  if (error) return <div className="p-4 sm:p-6 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white shadow rounded-xl space-y-3">
      <h1 className="text-xl sm:text-2xl font-semibold mb-2">All Call Logs</h1>

      {/* Total Call Logs */}
      <div className="text-sm sm:text-base text-gray-600 mb-2">
        Total Call Logs: {callLogs.length}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-2 sm:gap-3 mb-4 sm:mb-6 p-2 sm:p-3 bg-gray-50 rounded-md shadow-sm">
        <div className="flex flex-col">
          <label className="text-[10px] sm:text-xs text-gray-500 mb-1">
            From
          </label>
          <NepaliDatePicker
            initialDate={fromDate || null}
            onDateChange={setFromDate}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-[10px] sm:text-xs text-gray-500 mb-1">
            To
          </label>
          <NepaliDatePicker
            initialDate={toDate || null}
            onDateChange={setToDate}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-[10px] sm:text-xs text-gray-500 mb-1">
            Created By
          </label>
          <select
            value={createdById}
            onChange={(e) => setCreatedById(e.target.value)}
            className="border rounded px-2 py-1 min-w-[120px] sm:min-w-[150px]"
          >
            <option value="">All Creators</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-1 sm:gap-2 mt-2 sm:mt-0">
          <button
            onClick={() => fetchCallLogs(true)}
            className="bg-[#99b84f] text-white px-3 sm:px-4 py-1 rounded hover:bg-[#5a6e2a] transition"
          >
            Filter
          </button>
          <button
            onClick={() => {
              const todayBS = ADToBS(new Date());
              setFromDate(todayBS);
              setToDate(todayBS);
              setCreatedById("");
              fetchCallLogs(false);
            }}
            className="bg-gray-300 text-gray-800 px-3 sm:px-4 py-1 rounded hover:bg-gray-400 transition"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Call Logs List */}
      {callLogs.length === 0 ? (
        <p className="text-sm sm:text-base">No call logs found.</p>
      ) : (
        <>
          {paginatedLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            return (
              <div
                key={log.id}
                onClick={() => toggleExpand(log.id)}
                className="border p-2 sm:p-4 rounded-md flex flex-col cursor-pointer hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm sm:text-xl font-semibold">
                      {log.customer.organization_name}
                    </p>
                    <p className="text-[10px] sm:text-sm text-gray-500">
                      {formatToNepali(log.callTime)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${
                        log.callStatus === "CONNECTED"
                          ? "bg-green-500 text-white"
                          : log.callStatus === "NOT_PICKED"
                            ? "bg-yellow-500 text-white"
                            : log.callStatus === "BUSY"
                              ? "bg-red-500 text-white"
                              : "bg-gray-400 text-white"
                      }`}
                    >
                      {log.callStatus}
                    </span>
                    <span className="text-sm sm:text-lg">
                      {isExpanded ? <ChevronUp /> : <ChevronDown />}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-2 space-y-1 text-xs sm:text-sm pl-1 sm:pl-2">
                    <p className="leading-tight">
                      <strong>Created By:</strong> {log.calledBy?.name || "—"}
                    </p>
                    <p className="leading-tight">
                      <strong>Response:</strong> {log.response || "—"}
                    </p>
                    <p className="leading-tight">
                      <strong>Notes:</strong> {log.notes || "—"}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Pagination (only if total > perPage) */}
          {callLogs.length > perPage && (
            <Pagination
              total={callLogs.length}
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
