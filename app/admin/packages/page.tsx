"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/admin-components-deepak/DataTable";

interface Package {
  id: number;
  name: string;
  description: string;
  price: number;
  discount: number;
  stock: number;
  imageUrl: string | null;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  products?: { id: number; name: string }[];
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  //  Fetch all packages
  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/packages");
      setPackages(res.data.packages || res.data || []);
    } catch (error) {
      console.error("Failed to fetch packages:", error);
      toast.error("Failed to load packages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  //  Delete a package
  const handleDelete = async (pkg: Package) => {
    if (!confirm(`Are you sure you want to delete "${pkg.name}"?`)) return;
    try {
      await axios.delete(`/api/packages/${pkg.id}`);
      toast.success("Package deleted successfully");
      fetchPackages();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete package");
    }
  };

  //  View details
  const handleView = (pkg: Package) => {
    router.push(`/admin/packages/view/${pkg.id}`);
  };

  //  Edit package
  const handleEdit = (pkg: Package) => {
    router.push(`/admin/packages/edit/${pkg.id}`);
  };

  //  Define columns for the DataTable
  const columns: Column<Package>[] = [
    {
      key: "imageUrl" as keyof Package,
      label: "Image",
      render: (pkg: Package) =>
        pkg.imageUrl ? (
          <Image
            src={pkg.imageUrl}
            alt={pkg.name}
            width={50}
            height={50}
            className="rounded-md object-cover"
          />
        ) : (
          <span className="text-gray-400 italic">No Image</span>
        ),
    },
    { key: "name" as keyof Package, label: "Name" },
    {
      key: "price" as keyof Package,
      label: "Price",
      render: (pkg: Package) => `Rs. ${pkg.price}`,
    },
    {
      key: "discount" as keyof Package,
      label: "Discount",
      render: (pkg: Package) =>
        pkg.discount ? (
          <Badge variant="secondary">{pkg.discount}%</Badge>
        ) : (
          <span className="text-gray-400">None</span>
        ),
    },
    { key: "stock" as keyof Package, label: "Stock" },
    {
      key: "isFeatured" as keyof Package,
      label: "Featured",
      render: (pkg: Package) =>
        pkg.isFeatured ? (
          <Badge className="bg-blue-500">Yes</Badge>
        ) : (
          <Badge variant="outline">No</Badge>
        ),
    },
    {
      key: "isActive" as keyof Package,
      label: "Status",
      render: (pkg: Package) =>
        pkg.isActive ? (
          <Badge className="bg-green-500">Active</Badge>
        ) : (
          <Badge className="bg-red-500">Inactive</Badge>
        ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="w-full flex items-center justify-between ">
        <h3 className="text-2xl font-bold">Package</h3>
        <button
          onClick={() => router.push("/admin/packages/add")}
          className="bg-[#aec958] rounded-2xl text-white px-4 py-2 hover:bg-green-100 transition"
        >
          Add Package
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading packages...</p>
      ) : (
        <DataTable
          title="Package List"
          data={packages}
          columns={columns}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
