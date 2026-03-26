"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

interface CallLog {
  id: number;
  callTime: string;
  callStatus: string;
  response: string;
  notes: string;
  customer: {
    organization_name: string;
  };
}

export default function AllCallLogsPage() {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null); // track expanded log

  useEffect(() => {
    const fetchCallLogs = async () => {
      setLoading(true);
      const token = Cookies.get("token");
      if (!token) {
        setError("Unauthorized: No token found");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/call-logs", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch call logs");

        const data: CallLog[] = await res.json();
        setCallLogs(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchCallLogs();
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  if (loading) return <div className="p-6">Loading call logs...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto mt-6 p-6 bg-white shadow rounded-xl space-y-3">
      <h1 className="text-2xl font-semibold mb-4">All Call Logs</h1>

      {callLogs.length === 0 ? (
        <p>No call logs found.</p>
      ) : (
        callLogs.map((log) => {
          const isExpanded = expandedLogId === log.id;
          return (
            <div
              key={log.id}
              onClick={() => toggleExpand(log.id)}
              className="border p-4 rounded-md flex flex-col cursor-pointer hover:bg-gray-50 transition"
            >
              <div className="flex justify-between items-center">
                <p>
                  <strong>Organization:</strong>{" "}
                  {log.customer.organization_name}
                </p>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
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
              </div>

              {isExpanded && (
                <div className="mt-3 space-y-1 pl-2">
                  <p>
                    <strong>Call Time:</strong>{" "}
                    {log.callTime
                      ? new Date(log.callTime).toLocaleString()
                      : "—"}
                  </p>
                  <p>
                    <strong>Response:</strong> {log.response || "—"}
                  </p>
                  <p>
                    <strong>Notes:</strong> {log.notes || "—"}
                  </p>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
