"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useCartContext } from "@/context/CartContext";

// TypeScript interfaces
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
}

interface Package {
  id: number;
  name: string;
  description: string;
  price: number;
  discount?: number;
  stock?: number;
  imageUrl?: string;
  category?: string;
  createdBy?: { name: string };
  benefits?: string[];
  specifications?: Record<string, string>;
  products?: Product[];
}

const SAMPLE_DATA = [
  {
    id: 1,
    benefits: [
      "Save 25% compared to buying individually",
      "Everything you need to start working from home",
      "Ergonomic setup for better productivity",
      "Professional appearance for video calls",
    ],
    specifications: {
      "Total Items": "5 products",
      Compatibility: "Universal",
      Warranty: "1 year",
      Shipping: "Free worldwide",
    },
  },
  {
    id: 2,
    benefits: [
      "Save 25% compared to buying individually",
      "Professional-grade equipment",
      "Perfect for remote work and streaming",
      "Extended warranty coverage",
    ],
    specifications: {
      "Total Items": "7 products",
      Compatibility: "Universal",
      Warranty: "2 years",
      Shipping: "Free worldwide",
    },
  },

  {
    id: 3,
    benefits: [
      "Save 25% compared to buying individually",
      "Professional-grade equipment",
      "Perfect for remote work and streaming",
      "Extended warranty coverage",
    ],
    specifications: {
      "Total Items": "7 products",
      Compatibility: "Universal",
      Warranty: "2 years",
      Shipping: "Free worldwide",
    },
  },

  {
    id: 4,
    benefits: [
      "Save 25% compared to buying individually",
      "Professional-grade equipment",
      "Perfect for remote work and streaming",
      "Extended warranty coverage",
    ],
    specifications: {
      "Total Items": "7 products",
      Compatibility: "Universal",
      Warranty: "2 years",
      Shipping: "Free worldwide",
    },
  },

  {
    id: 5,
    benefits: [
      "Save 25% compared to buying individually",
      "Professional-grade equipment",
      "Perfect for remote work and streaming",
      "Extended warranty coverage",
    ],
    specifications: {
      "Total Items": "7 products",
      Compatibility: "Universal",
      Warranty: "2 years",
      Shipping: "Free worldwide",
    },
  },

  {
    id: 6,
    benefits: [
      "Save 25% compared to buying individually",
      "Professional-grade equipment",
      "Perfect for remote work and streaming",
      "Extended warranty coverage",
    ],
    specifications: {
      "Total Items": "7 products",
      Compatibility: "Universal",
      Warranty: "2 years",
      Shipping: "Free worldwide",
    },
  },

  {
    id: 7,
    benefits: [
      "Save 25% compared to buying individually",
      "Professional-grade equipment",
      "Perfect for remote work and streaming",
      "Extended warranty coverage",
    ],
    specifications: {
      "Total Items": "7 products",
      Compatibility: "Universal",
      Warranty: "2 years",
      Shipping: "Free worldwide",
    },
  },

  {
    id: 8,
    benefits: [
      "Save 25% compared to buying individually",
      "Professional-grade equipment",
      "Perfect for remote work and streaming",
      "Extended warranty coverage",
    ],
    specifications: {
      "Total Items": "7 products",
      Compatibility: "Universal",
      Warranty: "2 years",
      Shipping: "Free worldwide",
    },
  },

  {
    id: 9,
    benefits: [
      "Save 25% compared to buying individually",
      "Professional-grade equipment",
      "Perfect for remote work and streaming",
      "Extended warranty coverage",
    ],
    specifications: {
      "Total Items": "7 products",
      Compatibility: "Universal",
      Warranty: "2 years",
      Shipping: "Free worldwide",
    },
  },

  {
    id: 10,
    benefits: [
      "Save 25% compared to buying individually",
      "Professional-grade equipment",
      "Perfect for remote work and streaming",
      "Extended warranty coverage",
    ],
    specifications: {
      "Total Items": "7 products",
      Compatibility: "Universal",
      Warranty: "2 years",
      Shipping: "Free worldwide",
    },
  },
];

export default function PackageDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCartContext();

  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    async function fetchPackage() {
      try {
        const res = await fetch(`/api/packages/${id}`);
        if (!res.ok) throw new Error("Failed to fetch package");
        const data = await res.json();
        setPkg(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchPackage();
  }, [id]);

  const sampleData = SAMPLE_DATA.find((p) => p.id === Number(id));
  const handleAddToCart = () => {
    if (!pkg) return;
    addToCart(
      {
        id: pkg.id,
        name: pkg.name,
        price: pkg.price,
        image: pkg.imageUrl,
        category: "Package",
      },
      quantity
    );
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  if (loading)
    return (
      <main className="min-h-screen flex justify-center items-center">
        <p className="text-muted-foreground text-lg">Loading package...</p>
      </main>
    );

  if (error)
    return (
      <main className="min-h-screen flex justify-center items-center">
        <p className="text-red-500">{error}</p>
      </main>
    );

  if (!pkg)
    return (
      <main className="min-h-screen flex justify-center items-center">
        <p className="text-muted-foreground">Package not found</p>
      </main>
    );

  const originalPrice = pkg.price + (pkg.discount || 0);
  const discount = pkg.discount
    ? Math.round(((originalPrice - pkg.price) / originalPrice) * 100)
    : 0;

  return (
    <main className="min-h-screen font-poppins">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Link
          href="/packages"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Packages
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <Card className="overflow-hidden">
              <div className="relative h-96 w-full bg-muted">
                <img
                  src={pkg.imageUrl || "/placeholder.svg"}
                  alt={pkg.name}
                  className="h-full w-full object-cover"
                />
                {discount > 0 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-lg text-lg font-bold">
                    -{discount}%
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div>
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">
                {pkg.category || "Package"}
              </p>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {pkg.name}
              </h1>
              <p className="text-lg text-muted-foreground">{pkg.description}</p>
            </div>

            <Card className="p-4 mb-6 bg-muted">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-foreground">
                  Rs. {pkg.price.toFixed(2)}
                </span>
                {pkg.discount && pkg.discount > 0 && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      Rs. {originalPrice.toFixed(2)}
                    </span>
                    <span className="text-sm font-semibold text-green-600">
                      Save Rs. {pkg.discount.toFixed(2)}
                    </span>
                  </>
                )}
              </div>
            </Card>

            {/* <p className="text-sm text-muted-foreground mb-2">
              Stock: {pkg.stock ?? "N/A"} items
            </p> */}
            {pkg.createdBy && (
              <p className="text-sm text-muted-foreground mb-4">
                Created By:{" "}
                <span className="font-semibold">{pkg.createdBy.name}</span>
              </p>
            )}

            <div className="mb-6 flex gap-4">
              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  −
                </button>
                <span className="px-4 py-2 font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  +
                </button>
              </div>
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={pkg.stock === 0}
                className={
                  isAdded ? "bg-green-600 hover:bg-green-700" : "bg-secondary"
                }
              >
                {isAdded ? "✓ Added to Cart" : "Add to Cart"}
              </Button>
            </div>
          </div>
        </div>

        {pkg.benefits && (
          <Card className="p-4 mt-12 mb-6">
            <h3 className="font-semibold text-foreground mb-3">
              Package Benefits
            </h3>
            <ul className="space-y-2">
              {pkg.benefits.map((benefit, idx) => (
                <li
                  key={idx}
                  className="flex gap-2 text-sm text-muted-foreground"
                >
                  <span className="text-green-600 font-bold">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {pkg.specifications && (
          <Card className="p-4 mb-12">
            <h3 className="font-semibold text-foreground mb-3">
              Specifications
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(pkg.specifications).map(([key, value]) => (
                <div key={key}>
                  <p className="text-xs text-muted-foreground">{key}</p>
                  <p className="font-semibold text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {sampleData?.benefits && (
          <Card className="p-4 mt-12 mb-6">
            <h3 className="font-semibold text-foreground mb-3">
              Package Benefits
            </h3>
            <ul className="space-y-2">
              {sampleData.benefits.map((benefit, idx) => (
                <li
                  key={idx}
                  className="flex gap-2 text-sm text-muted-foreground"
                >
                  <span className="text-green-600 font-bold">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* {sampleData?.specifications && (
          <Card className="p-4 mb-12">
            <h3 className="font-semibold text-foreground mb-3">
              Specifications
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(sampleData.specifications).map(([key, value]) => (
                <div key={key}>
                  <p className="text-xs text-muted-foreground">{key}</p>
                  <p className="font-semibold text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </Card>
        )} */}

        {pkg.products && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Included Products ({pkg.products.length})
            </h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pkg.products.map((product) => (
                <Card key={product.id} className="p-4">
                  {/* Product Image */}
                  <div className="w-full h-50 mb-3 overflow-hidden rounded-lg bg-muted">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src="/logo.jpeg"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <h4 className="font-semibold text-foreground">
                    {product.name}
                  </h4>

                  <p className="text-sm text-muted-foreground mb-2">
                    {product.description}
                  </p>

                  <p className="text-lg font-bold text-foreground">
                    Rs. {product.price.toFixed(2)}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
