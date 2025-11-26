"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ProductFiltersProps {
  filters: {
    categories: string[];
    brands: string[];
    priceRange: [number, number];
    minRating: number;
  };

  onFilterChange: (filters: {
    categories: string[];
    brands: string[];
    priceRange: [number, number];
    minRating: number;
  }) => void;
}

const RATINGS = [
  { value: 0, label: "All Ratings" },
  { value: 4, label: "4★ & up" },
  { value: 4.5, label: "4.5★ & up" },
];

export function ProductFilters({
  filters,
  onFilterChange,
}: ProductFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories"); // adjust your API route if different
        const data = await res.json();
        setCategories(data.map((c: any) => c.name)); // assumes category has a 'name' field
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/brands"); // adjust your API route if different
        const data = await res.json();
        setBrands(data.map((c: any) => c.name)); // assumes category has a 'name' field
      } catch (error) {
        console.error("Failed to load Brands:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleBrandChange = (brand: string, checked: boolean) => {
    const newCategories = checked
      ? [...localFilters.brands, brand]
      : localFilters.brands.filter((c) => c !== brand);

    const updated = { ...localFilters, brands: newCategories };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...localFilters.categories, category]
      : localFilters.categories.filter((c) => c !== category);

    const updated = { ...localFilters, categories: newCategories };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handlePriceChange = (value: number[]) => {
    const updated = {
      ...localFilters,
      priceRange: [value[0], value[1]] as [number, number],
    };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handleRatingChange = (rating: number) => {
    const updated = { ...localFilters, minRating: rating };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handleReset = () => {
    const resetFilters = {
      categories: [],
      brands: [],
      priceRange: [0, 200] as [number, number],
      minRating: 0,
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <Card className="sticky top-4 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Filters</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Reset
        </Button>
      </div>
      {/* Categories Filter */}
      <div className="space-y-3">
        <h3 className="font-medium text-foreground">Category</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={localFilters.categories.includes(category)}
                onCheckedChange={(checked) =>
                  handleCategoryChange(category, checked as boolean)
                }
              />
              <Label
                htmlFor={category}
                className="cursor-pointer text-sm font-normal text-foreground"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>
      {/* Brands Filter */}
      <div className="space-y-3">
        <h3 className="font-medium text-foreground">Brands</h3>
        <div className="space-y-2">
          {brands.map((brand, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Checkbox
                id={brand}
                checked={localFilters.brands.includes(brand)}
                onCheckedChange={(checked) =>
                  handleBrandChange(brand, checked as boolean)
                }
              />
              <Label
                htmlFor={brand}
                className="cursor-pointer text-sm font-normal text-foreground"
              >
                {brand}
              </Label>
            </div>
          ))}
        </div>
      </div>
      {/* Price Range Filter */}
      <div className="space-y-3">
        <h3 className="font-medium text-foreground">Price Range</h3>
        <Slider
          value={localFilters.priceRange}
          onValueChange={handlePriceChange}
          min={0}
          max={200}
          step={10}
          className="w-full"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Rs. {localFilters.priceRange[0]}</span>
          <span>Rs. {localFilters.priceRange[1]}</span>
        </div>
      </div>
      {/* Rating Filter
      <div className="space-y-3">
        <h3 className="font-medium text-foreground">Rating</h3>
        <div className="space-y-2">
          {RATINGS.map((rating) => (
            <div key={rating.value} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating.value}`}
                checked={localFilters.minRating === rating.value}
                onCheckedChange={() => handleRatingChange(rating.value)}
              />
              <Label
                htmlFor={`rating-${rating.value}`}
                className="cursor-pointer text-sm font-normal text-foreground"
              >
                {rating.label}
              </Label>
            </div>
          ))}
        </div>
      </div> */}
    </Card>
  );
}
