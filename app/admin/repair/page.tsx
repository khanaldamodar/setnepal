"use client";

import React, { useEffect, useState } from "react";
import CRUDTable from "@/components/admin-components/CRUDTable";

interface MaintenanceType {
  id: number;
  name: string;
  phone: string;
  address: string;
  product: string;
  message: string;
  createdAt?: string;
  updatedAt?: string;
}

const MaintenancePage = () => {
  const [maintenances, setMaintenances] = useState<MaintenanceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMaintenance, setSelectedMaintenance] =
    useState<MaintenanceType | null>(null);

  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const res = await fetch("/api/repair");
        if (!res.ok) throw new Error("Failed to fetch maintenance requests");

        const json = await res.json();
        // Use json.maintenance array
        setMaintenances(json.maintenance || []);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchMaintenance();
  }, []);

  if (loading)
    return <div className="p-6 text-lg">Loading Maintenance Requests...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="h-screen flex flex-col font-poppins">
      {/* Header */}
      <div className="w-full flex items-center p-4 justify-between">
        <h3 className="text-2xl font-bold">Maintenance Requests</h3>
      </div>

      {/* Table */}
      <div className="flex-1 p-4 w-full">
        {maintenances.length > 0 ? (
          <CRUDTable
            endpoint="repair"
            columns={["name", "phone", "product"]}
            data={maintenances}
            setData={setMaintenances}
            actions={["view"]}
            renderCell={(column, row) => {
              if (column === "actions") {
                return (
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => setSelectedMaintenance(row)}
                  >
                    View Details
                  </button>
                );
              }
              return row[column as keyof MaintenanceType];
            }}
          />
        ) : (
          <div className="text-center text-gray-400 mt-10">
            No maintenance requests found.
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedMaintenance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-11/12 max-w-3xl overflow-auto max-h-[90vh] relative">
            <h2 className="text-xl font-bold mb-4">Maintenance Details</h2>
            <button
              onClick={() => setSelectedMaintenance(null)}
              className="absolute top-2 right-4 text-red-500 font-bold text-xl"
            >
              &times;
            </button>

            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {selectedMaintenance.name}
              </p>
              <p>
                <strong>Phone:</strong> {selectedMaintenance.phone}
              </p>
              <p>
                <strong>Address:</strong> {selectedMaintenance.address}
              </p>
              <p>
                <strong>Product:</strong> {selectedMaintenance.product}
              </p>
              <p>
                <strong>Message:</strong> {selectedMaintenance.message}
              </p>
              {selectedMaintenance.createdAt && (
                <p>
                  <strong>Created At:</strong>{" "}
                  {new Date(selectedMaintenance.createdAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;
