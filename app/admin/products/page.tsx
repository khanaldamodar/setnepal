"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/admin-components-deepak/DataTable";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
  brand?: { name: string };
  isActive: boolean;
  isFeatured: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ✅ Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/products");
        setProducts(res.data || []);
      } catch (err) {
        console.error("Error fetching products:", err);
        toast.error("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ✅ Delete a product
  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return;
    try {
      await axios.delete(`/api/products/${product.id}`);
      toast.success("Product deleted successfully");
      setProducts(products.filter((p) => p.id !== product.id));
    } catch (err) {
      toast.error("Failed to delete product");
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6 font-poppins">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link href="/admin/products/add">
          <Button className="flex items-center gap-2">
            <Plus size={18} /> Add Product
          </Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-center py-10 text-gray-500">Loading products...</p>
      ) : (
        <DataTable
          title="All Products"
          data={products}
          columns={[
            {
              key: "imageUrl",
              label: "Image",
              render: (p) => (
                <div className="w-12 h-12 rounded-md overflow-hidden">
                  <Image
                    src={p.imageUrl || "/placeholder.png"}
                    alt={p.name}
                    width={50}
                    height={50}
                    className="object-cover w-full h-full"
                  />
                </div>
              ),
            },
            { key: "name", label: "Product Name" },
            { key: "price", label: "Price", render: (p) => `Rs. ${p.price}` },
            { key: "stock", label: "Stock" },
            {
              key: "brand",
              label: "Brand",
              render: (p) => p.brand?.name || "-",
            },
            {
              key: "isActive",
              label: "Status",
              render: (p) => (
                <Badge variant={p.isActive ? "success" : "secondary"}>
                  {p.isActive ? "Active" : "Inactive"}
                </Badge>
              ),
            },
          ]}
          onView={(item) => router.push(`/admin/products/${item.id}`)}
          onEdit={(item) => router.push(`/admin/products/edit/${item.id}`)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
