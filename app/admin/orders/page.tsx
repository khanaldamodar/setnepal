"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/admin-components-deepak/DataTable";
import Cookies from "js-cookie";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("/api/orders", {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }); // your API endpoint
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleView = (id: number) => {
    router.push(`/admin/orders/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    try {
      await axios.delete(`/api/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error("Failed to delete order:", err);
    }
  };

  const columns = [
    { key: "id", label: "Order ID" },
    {
      key: "user",
      label: "Customer",
      render: (row: any) => row.user?.name || "N/A",
    },
    { key: "total", label: "Total (Rs)" },
    { key: "status", label: "Status" },
    { key: "paymentMethod", label: "Payment" },
    { key: "paymentStatus", label: "Payment Status" },
    {
      key: "createdAt",
      label: "Date",
      render: (row: any) => new Date(row.createdAt).toLocaleString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row: any) => (
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => handleView(row.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            onClick={() => handleDelete(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card className="m-4 shadow-md font-poppins">
      <CardHeader>
        <CardTitle>Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
          </div>
        ) : (
          <DataTable columns={columns} data={orders} />
        )}
      </CardContent>
    </Card>
  );
}
