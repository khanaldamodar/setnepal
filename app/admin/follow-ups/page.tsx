"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { ADToBS } from "bikram-sambat-js";

interface FollowUp {
  id: number;
  scheduledAt: string;
  status: "PENDING" | "COMPLETED" | "MISSED";
  notes?: string;
  customer: {
    organization_name: string;
  };
}

export default function AllFollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchFollowUps = async () => {
      setLoading(true);
      const token = Cookies.get("token");
      if (!token) {
        setError("Unauthorized: No token found");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/follow-ups", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch follow-ups");

        const data: FollowUp[] = await res.json();
        setFollowUps(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowUps();
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatToNepali = (iso: string | undefined) => {
    if (!iso) return "—";
    const date = new Date(iso);
    const bsDate = ADToBS(date);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${bsDate} ${hours}:${minutes}`;
  };

  if (loading) return <div className="p-6">Loading follow-ups...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto mt-6 p-6 bg-white shadow rounded-xl space-y-3">
      <h1 className="text-2xl font-semibold mb-4">All Follow-Ups</h1>

      {followUps.length === 0 ? (
        <p>No follow-ups found.</p>
      ) : (
        followUps.map((fu) => {
          const isExpanded = expandedId === fu.id;
          return (
            <div
              key={fu.id}
              onClick={() => toggleExpand(fu.id)}
              className="border p-4 rounded-md flex flex-col cursor-pointer hover:bg-gray-50 transition"
            >
              <div className="flex justify-between items-center">
                <p>
                  <strong>Organization:</strong> {fu.customer.organization_name}
                </p>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    fu.status === "PENDING"
                      ? "bg-yellow-500 text-white"
                      : fu.status === "COMPLETED"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                  }`}
                >
                  {fu.status}
                </span>
              </div>

              {isExpanded && (
                <div className="mt-3 space-y-1 pl-2">
                  <p>
                    <strong>Scheduled At:</strong>{" "}
                    {formatToNepali(fu.scheduledAt)}
                  </p>
                  {fu.notes && (
                    <p>
                      <strong>Notes:</strong> {fu.notes}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
