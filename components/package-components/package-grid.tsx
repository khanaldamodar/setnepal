"use client";

import type React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useCartContext } from "@/context/CartContext";

interface Package {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  imageUrl: string;
  stock: number;
}

export function PackageGrid() {
  const { addToCart } = useCartContext();
  const [packages, setPackages] = useState<Package[]>([]);
  const [addedItems, setAddedItems] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPackages() {
      try {
        const res = await fetch("/api/packages");
        if (!res.ok) throw new Error("Failed to fetch packages");
        const data: Package[] = await res.json();
        setPackages(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPackages();
  }, []);

  const handleAddToCart = (e: React.MouseEvent, pkg: Package) => {
    e.preventDefault();
    addToCart(
      {
        id: pkg.id,
        name: pkg.name,
        price: pkg.price,
        image: pkg.imageUrl,
        category:
          typeof pkg.category === "string"
            ? pkg.category
            : pkg.category?.name ?? "",
      },
      1
    );

    setAddedItems((prev) => new Set(prev).add(pkg.id));
    setTimeout(() => {
      setAddedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(pkg.id);
        return newSet;
      });
    }, 2000);
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Loading packages...
      </div>
    );
  }

  if (!packages.length) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No packages available.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {packages.map((pkg) => {
        const discount = Math.round(
          ((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100
        );

        return (
          <Link key={pkg.id} href={`/packages/${pkg.id}`}>
            <Card className="overflow-hidden transition-all hover:shadow-lg cursor-pointer h-full flex flex-col">
              {/* Package Image */}
              <div className="relative h-48 w-full overflow-hidden bg-muted">
                <img
                  src={pkg.imageUrl || "/placeholder.svg"}
                  alt={pkg.name}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
                {discount > 0 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                    -{discount}%
                  </div>
                )}
              </div>

              {/* Package Info */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="mb-2">
                  <h3 className="font-semibold text-foreground line-clamp-2">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {pkg.description}
                  </p>
                </div>

                {/* Product Count */}
                <div className="mb-3 text-xs text-muted-foreground">
                  <span className="font-medium">{pkg.stock} items</span>{" "}
                  included
                </div>

                {/* Static Rating */}
                <div className="mb-3 flex items-center gap-1">
                  <div className="flex text-yellow-400">{"★".repeat(4)}</div>
                  <span className="text-xs text-muted-foreground">(4.0)</span>
                </div>

                {/* Price and Button */}
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-foreground">
                      Rs. {pkg.price.toFixed(2)}
                    </span>
                    {pkg.originalPrice > pkg.price && (
                      <span className="text-xs text-muted-foreground line-through">
                        Rs. {pkg.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={addedItems.has(pkg.id) ? "default" : "default"}
                    onClick={(e) => handleAddToCart(e, pkg)}
                    className={
                      addedItems.has(pkg.id)
                        ? "bg-green-600 hover:bg-green-700"
                        : ""
                    }
                  >
                    {addedItems.has(pkg.id) ? "Added" : "Add to Cart"}
                  </Button>
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
