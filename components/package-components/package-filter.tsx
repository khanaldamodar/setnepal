"use client";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface PackageFiltersProps {
  filters: {
    categories: string[];
    priceRange: [number, number];
    minRating: number;
  };
  onFilterChange: (filters: {
    categories: string[];
    priceRange: [number, number];
    minRating: number;
  }) => void;
}

const CATEGORIES = ["Office Setup", "Professional", "Accessories", "Gaming"];
const RATINGS = [4, 3, 2, 1];

export function PackageFilters({
  filters,
  onFilterChange,
}: PackageFiltersProps) {
  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter((c) => c !== category);
    onFilterChange({ ...filters, categories: newCategories });
  };

  const handlePriceChange = (value: number[]) => {
    onFilterChange({ ...filters, priceRange: [value[0], value[1]] });
  };

  const handleRatingChange = (rating: number, checked: boolean) => {
    onFilterChange({ ...filters, minRating: checked ? rating : 0 });
  };

  return (
    <div className="sticky top-4 space-y-4">
      {/* Categories */}
      <Card className="p-4">
        <h3 className="font-semibold text-foreground mb-3">Categories</h3>
        <div className="space-y-2">
          {CATEGORIES.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category}`}
                checked={filters.categories.includes(category)}
                onCheckedChange={(checked) =>
                  handleCategoryChange(category, checked as boolean)
                }
              />
              <Label
                htmlFor={`category-${category}`}
                className="text-sm cursor-pointer"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </Card>

      {/* Price Range */}
      <Card className="p-4">
        <h3 className="font-semibold text-foreground mb-3">Price Range</h3>
        <Slider
          value={[filters.priceRange[0], filters.priceRange[1]]}
          onValueChange={handlePriceChange}
          min={0}
          max={1000}
          step={50}
          className="mb-3"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Rs. {filters.priceRange[0]}</span>
          <span>Rs. {filters.priceRange[1]}</span>
        </div>
      </Card>

      {/* Rating */}
      {/* <Card className="p-4">
        <h3 className="font-semibold text-foreground mb-3">Rating</h3>
        <div className="space-y-2">
          {RATINGS.map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={filters.minRating === rating}
                onCheckedChange={(checked) => handleRatingChange(rating, checked as boolean)}
              />
              <Label htmlFor={`rating-${rating}`} className="text-sm cursor-pointer flex items-center gap-1">
                <span className="flex text-yellow-400">{"★".repeat(rating)}</span>
                <span className="text-muted-foreground">& up</span>
              </Label>
            </div>
          ))}
        </div>
      </Card> */}
    </div>
  );
}
