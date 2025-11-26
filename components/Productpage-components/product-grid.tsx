"use client";

import type React from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { useState } from "react";
import { useCartContext } from "@/context/CartContext";

interface CategoryType {
  id: number;
  name?: string;
}
interface Product {
  id: number;
  name: string;
  price: number;
  category: CategoryType[];
  rating: number;
  imageUrl: string;
}

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  // const { addToCart } = useCart()
  const [addedItems, setAddedItems] = useState<Set<number>>(new Set());
  const { addToCart } = useCartContext();

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.imageUrl,
        category: product.category?.[0]?.name ?? "",
      },
      1
    );

    // Show feedback
    setAddedItems((prev) => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }, 2000);
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Link key={product.id} href={`/products/${product.id}`}>
          <Card className="overflow-hidden transition-all hover:shadow-lg cursor-pointer">
            {/* Product Image */}
            <div className="relative h-48 w-full overflow-hidden bg-muted">
              <img
                src={product.imageUrl || "/placeholder.svg"}
                alt={product.name}
                className="h-full w-full object-cover transition-transform hover:scale-105"
              />
            </div>

            {/* Product Info */}
            <div className="p-4">
              <div className="mb-2 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {product.category?.[0]?.name}
                  </p>
                </div>
              </div>

              {/* Rating */}
              {/* <div className="mb-3 flex items-center gap-1">
                <div className="flex text-yellow-400">
                  {"★".repeat(Math.floor(product.rating))}
                </div>
                <span className="text-xs text-muted-foreground">
                  ({product.rating})
                </span>
              </div> */}

              {/* Price and Button */}
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-foreground">
                  Rs. {product.price.toFixed(2)}
                </span>
                <Button
                  size="sm"
                  variant={addedItems.has(product.id) ? "default" : "default"}
                  onClick={(e) => handleAddToCart(e, product)}
                  className={
                    addedItems.has(product.id)
                      ? "bg-secondary hover:bg-green-700"
                      : "bg-secondary"
                  }
                >
                  {addedItems.has(product.id) ? "✓ Added" : "Add to Cart"}
                </Button>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
