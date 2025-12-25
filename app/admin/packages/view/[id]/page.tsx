"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { ArrowLeft, Package, User, Tag, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  sku?: string | null;
  weight?: number | null;
  imageUrl?: string | null;
  isFeatured: boolean;
  isActive: boolean;
}

interface PackageProduct {
  quantity: number;
  product: Product;
}

interface Category {
  id: number;
  name: string;
}

interface CreatedBy {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface PackageData {
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
  createdBy: CreatedBy;
  packageProducts: PackageProduct[];
  products?: Product[]; // Old support
  categoryId?: number; // from API
  benefits?: string[] | null;
}

export default function ViewPackagePage() {
  const { id } = useParams();
  const router = useRouter();
  const [pkg, setPkg] = useState<PackageData | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchPackage();
  }, [id]);

  const fetchPackage = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/packages/${id}`);
      const data = res.data.package || res.data;
      setPkg(data);

      // Fetch category if categoryId exists
      if (data.categoryId) {
        const catRes = await axios.get(`/api/categories/${data.categoryId}`);
        setCategory(catRes.data);
      }
    } catch (error) {
      console.error("Failed to fetch package:", error);
      toast.error("Failed to load package");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <p className="text-gray-500 p-6 text-center">
        Loading package details...
      </p>
    );

  if (!pkg)
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 mb-4">Package not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );

  // Helper to get products (supporting new and old structure fallback)
  const displayProducts = pkg.packageProducts ||
    (pkg.products ? pkg.products.map(p => ({ product: p, quantity: 1 })) : []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Package className="text-primary" /> {pkg.name}
          </h1>
        </div>
      </div>

      {/* Package Info Card */}
      <Card className="shadow-sm rounded-2xl border">
        <CardHeader>
          <CardTitle className="text-xl">Package Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <p>
              <strong>Description:</strong>{" "}
              {pkg.description || "No description"}
            </p>
            <p>
              <strong>Price:</strong> Rs. {pkg.price}
            </p>
            <p>
              <strong>Discount:</strong> {pkg.discount}%
            </p>
            <p>
              <strong>Stock:</strong> {pkg.stock}
            </p>
            <div className="flex gap-2">
              <Badge variant={pkg.isFeatured ? "default" : "outline"}>
                {pkg.isFeatured ? "Featured" : "Not Featured"}
              </Badge>
              <Badge className={pkg.isActive ? "bg-green-500" : "bg-red-500"}>
                {pkg.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          {/* Image */}
          <div className="flex justify-center items-center">
            {pkg.imageUrl ? (
              <Image
                src={pkg.imageUrl}
                alt={pkg.name}
                width={250}
                height={250}
                className="rounded-xl object-cover border"
              />
            ) : (
              <div className="w-64 h-64 bg-gray-100 flex flex-col items-center justify-center text-gray-400 rounded-xl">
                <Tag className="w-10 h-10 mb-2" />
                No Image
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Creator Info */}
      <Card className="shadow-sm rounded-2xl border">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <User className="w-5 h-5" /> Created By
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <strong>Name:</strong> {pkg.createdBy?.name || "N/A"}
            </p>
            <p>
              <strong>Email:</strong> {pkg.createdBy?.email || "N/A"}
            </p>
            <Badge>{pkg.createdBy?.role || "N/A"}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Product List */}
      <Card className="shadow-sm rounded-2xl border">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" /> Products in this Package
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Price (Unit)</th>
                    <th className="px-4 py-2 text-left">Qty in Package</th>
                    <th className="px-4 py-2 text-left">Total Value</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayProducts.map((pp) => (
                    <tr key={pp.product.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{pp.product.id}</td>
                      <td className="px-4 py-2">{pp.product.name}</td>
                      <td className="px-4 py-2">Rs. {pp.product.price}</td>
                      <td className="px-4 py-2 font-bold">{pp.quantity}</td>
                      <td className="px-4 py-2">Rs. {pp.product.price * pp.quantity}</td>
                      <td className="px-4 py-2">
                        <Badge
                          className={
                            pp.product.isActive ? "bg-green-500" : "bg-red-500"
                          }
                        >
                          {pp.product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic">
              No products linked to this package
            </p>
          )}
        </CardContent>
      </Card>

      {/* Category */}
      <Card className="shadow-sm rounded-2xl border">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Tag className="w-5 h-5" /> Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          {category ? (
            <Badge variant="outline">{category.name}</Badge>
          ) : (
            <p className="text-gray-500 italic">
              No category linked to this package
            </p>
          )}
        </CardContent>
      </Card>
      {/* Package Benefits */}
      <Card className="shadow-sm rounded-2xl border">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Star className="w-5 h-5" /> Package Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pkg.benefits && Array.isArray(pkg.benefits) && pkg.benefits.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {pkg.benefits.map((benefit, i) => (
                <li key={i} className="text-md">{String(benefit)}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No benefits listed</p>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
