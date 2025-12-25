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
  imageUrl?: string;
}

interface PackageProduct {
  quantity: number;
  product: Product;
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
  packageProducts?: PackageProduct[]; // New structure
  products?: Product[]; // Fallback
}

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
        const responseData = await res.json();
        // Handle nested structure if generic API wrapper returns { package: ... }
        const data = responseData.package || responseData;
        setPkg(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchPackage();
  }, [id]);

  const handleAddToCart = () => {
    if (!pkg) return;

    // Calculate final price for cart
    const basePrice = pkg.price;
    const discountPercent = pkg.discount || 0;
    const finalPrice = basePrice - (basePrice * discountPercent) / 100;

    addToCart(
      {
        id: pkg.id,
        name: pkg.name,
        price: finalPrice,
        image: pkg.imageUrl || "",
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

  // Price Calculation
  // Assuming pkg.price is the Base Price (List Price)
  // Assuming pkg.discount is the percentage (0-100)
  const basePrice = pkg.price;
  const discountPercent = pkg.discount || 0;
  const finalPrice = basePrice - (basePrice * discountPercent) / 100;
  const savedAmount = basePrice - finalPrice;

  // Determine products list (support both new and old structures)
  const packageItems = pkg.packageProducts ||
    (pkg.products ? pkg.products.map(p => ({ product: p, quantity: 1 })) : []);

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
          {/* Left Column: Image */}
          <div>
            <Card className="overflow-hidden border-0 shadow-none">
              <div className="relative aspect-square w-full bg-muted rounded-2xl overflow-hidden">
                <img
                  src={pkg.imageUrl || "/placeholder.svg"}
                  alt={pkg.name}
                  className="h-full w-full object-cover"
                />
                {discountPercent > 0 && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full text-lg font-bold shadow-md">
                    -{discountPercent}% OFF
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column: Details */}
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {pkg.category || "Package"}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {pkg.name}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {pkg.description}
              </p>
            </div>

            <Card className="p-6 mb-8 bg-muted/50 border shadow-sm rounded-xl">
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-primary">
                    Rs. {finalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  {discountPercent > 0 && (
                    <span className="text-xl text-muted-foreground line-through">
                      Rs. {basePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
                {discountPercent > 0 && (
                  <p className="text-sm font-medium text-green-600">
                    You save Rs. {savedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                )}
              </div>
            </Card>

            {/* {pkg.createdBy && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <span>Created By:</span>
                <span className="font-semibold text-foreground px-2 py-1 bg-gray-100 rounded-md">
                  {pkg.createdBy.name}
                </span>
              </div>
            )} */}

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center border border-border rounded-lg bg-card h-12 w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-muted-foreground hover:text-primary transition-colors h-full"
                >
                  −
                </button>
                <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 text-muted-foreground hover:text-primary transition-colors h-full"
                >
                  +
                </button>
              </div>

              <Button
                size="lg"
                onClick={handleAddToCart}
                className={`h-12 px-8 text-base transition-all duration-300 flex-1 sm:flex-none ${isAdded
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-secondary hover:bg-primary/90"
                  }`}
              >
                {isAdded ? "✓ Added to Cart" : "Add to Cart"}
              </Button>
            </div>

            {pkg.stock !== undefined && pkg.stock < 10 && pkg.stock > 0 && (
              <p className="text-orange-500 text-sm font-medium animate-pulse">
                Only {pkg.stock} left in stock - order soon!
              </p>
            )}
          </div>
        </div>

        {/* Benefits Section */}
        {pkg.benefits && pkg.benefits.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Why choose this package?</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {pkg.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-card border rounded-lg shadow-sm">
                  <div className="bg-green-100 text-green-600 p-1 rounded-full mt-0.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-card-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Included Products Section - UPDATED */}
        {packageItems.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <span>Included Products</span>
              <span className="bg-muted text-muted-foreground text-sm py-1 px-3 rounded-full font-normal">
                {packageItems.length} items
              </span>
            </h2>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {packageItems.map((item) => (
                <Card key={item.product.id} className="group overflow-hidden border hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                  {/* Product Image */}
                  <div className="aspect-[4/3] bg-muted overflow-hidden relative">
                    <img
                      src={item.product.imageUrl || "/placeholder.svg"}
                      alt={item.product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm">
                      Qty: {item.quantity}
                    </div>
                  </div>

                  <div className="p-5">
                    <h4 className="font-semibold text-lg text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                      {item.product.name}
                    </h4>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem]">
                      {item.product.description || "No description available"}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Unit Price</p>
                        <p className="font-bold text-foreground">
                          Rs. {item.product.price.toLocaleString('en-IN')}
                        </p>
                      </div>

                      {item.quantity > 1 && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Value</p>
                          <p className="font-bold text-primary">
                            Rs. {(item.product.price * item.quantity).toLocaleString('en-IN')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Specifications Section */}
        {pkg.specifications && (
          <div className="mt-12">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4 text-xl">
                Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                {Object.entries(pkg.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                    <span className="text-muted-foreground">{key}</span>
                    <span className="font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
