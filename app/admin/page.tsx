"use client";
import React, { useEffect, useState } from "react";
import Card from "@/components/admin-components/Card";
import { useRouter } from "next/navigation";
import path from "path";

interface DashboardType {
  totalProducts: number;
  totalPackages: number;
  totalCategories: number;
  totalBrands: number;
  totalOrders: number;
  totalPayments: number;
}

const Page = () => {
  const [dashboard, setDashboard] = useState<DashboardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("Failed to fetch dashboard");
        const data: DashboardType = await res.json();
        setDashboard(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <div className="p-6 text-lg">Loading Dashboard...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!dashboard) return <div className="p-6">No data available.</div>;

  const stats = [
    {
      label: "Total Brands",
      value: dashboard.totalBrands,
      path: "/admin/brands",
    },
    {
      label: "Total Products",
      value: dashboard.totalProducts,
      path: "/admin/products",
    },
    {
      label: "Total Packages",
      value: dashboard.totalPackages,
      path: "admin/packages",
    },
    {
      label: "Total Payments",
      value: dashboard.totalPayments,
      path: "admin/payments",
    },
    {
      label: "Total Orders",
      value: dashboard.totalOrders,
      path: "admin/orders",
    },
    {
      label: "Total Categories",
      value: dashboard.totalCategories,
      path: "admin/categories",
    },
  ];

  return (
    <div className=" sm:p-5">
      <h2 className="text-2xl font-bold p-4">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 ">
        {stats.map((item, index) => (
          <button
            onClick={() => router.push(item.path)}
            className="cursor-pointer"
          >
            <Card key={index} label={item.label} value={item.value} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Page;
