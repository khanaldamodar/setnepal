"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Product {
  id: number;
  name: string;
  price: number;
  category?: { id: number; name: string };
  rating?: number;
  image?: string;
}

interface RelatedProductsProps {
  currentProductId: number;
  categoryId: number;
}

export function RelatedProducts({
  currentProductId,
  categoryId,
}: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const res = await fetch(`/api/categories`);
        const categories = await res.json();

        const category = categories.find((c: any) => c.id === categoryId);

        if (category && Array.isArray(category.products)) {
          const related = category.products
            .filter((p: any) => p.id !== currentProductId)
            .slice(0, 4)
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              price: p.price,
              rating: p.rating || 0,
              image: p.imageUrl || "/placeholder.svg",
              category: { id: category.id, name: category.name },
            }));
          setProducts(related);
        }
      } catch (err) {
        console.error("Failed to fetch related products", err);
      }
    };

    if (categoryId) fetchRelatedProducts();
  }, [categoryId, currentProductId]);

  if (products.length === 0) return <p>No related products found.</p>;

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-foreground">
        Related Products
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <Card
            key={product.id}
            className="overflow-hidden transition-all hover:shadow-lg"
          >
            <div className="relative h-40 w-full overflow-hidden bg-muted">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover transition-transform hover:scale-105"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-foreground line-clamp-2">
                {product.name}
              </h3>
              {/* <div className="mb-3 mt-2 flex items-center gap-1">
                <div className="flex text-yellow-400">
                  {"★".repeat(Math.floor(product.rating || 0))}
                </div>
                <span className="text-xs text-muted-foreground">
                  ({product.rating})
                </span>
              </div> */}
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-foreground">
                  Rs. {product.price.toFixed(2)}
                </span>
                <Button size="sm" variant="default" className="bg-secondary">
                  View
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
