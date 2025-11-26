"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";

interface Maintenance {
  id: number;
  name: string;
  phone: string;
  address: string;
  product: string;
  message: string;
}

export default function MaintenanceViewPage() {
  const params = useParams();
  const router = useRouter();
  const [maintenance, setMaintenance] = useState<Maintenance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMaintenance() {
      try {
        setLoading(true);
        const res = await fetch(`/api/repair`); // Fetch all maintenance requests
        const data = await res.json();

        // Find the maintenance by ID from the array
        const found = data.maintenance.find(
          (m: Maintenance) => m.id === Number(params.id)
        );

        if (found) {
          setMaintenance(found);
        } else {
          setError("Maintenance request not found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch maintenance request");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) fetchMaintenance();
  }, [params.id]);

  if (loading)
    return (
      <p className="text-gray-500 p-6 text-center">
        Loading maintenance request...
      </p>
    );

  if (error)
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );

  if (!maintenance)
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Maintenance request not found.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </Button>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <FileText className="text-primary" /> Maintenance #{maintenance.id}
        </h1>
      </div>

      <Card className="shadow-sm rounded-2xl border">
        <CardHeader>
          <CardTitle className="text-xl">Request Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Name:</strong> {maintenance.name}
          </p>
          <p>
            <strong>Phone:</strong> {maintenance.phone}
          </p>
          <p>
            <strong>Address:</strong> {maintenance.address}
          </p>
          <p>
            <strong>Product:</strong> {maintenance.product}
          </p>
          <p>
            <strong>Message:</strong> {maintenance.message}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
