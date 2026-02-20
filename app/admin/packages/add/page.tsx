"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Upload } from "lucide-react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type SelectedProduct = {
  id: number;
  name: string;
  price: number;
  qty: number;
};

export default function AddPackagePage() {
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm();

  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  );

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<any[]>([]);

  const [searchProductQuery, setSearchProductQuery] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("");

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [benefits, setBenefits] = useState<string[]>([]);
  const [newBenefit, setNewBenefit] = useState("");

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit("");
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  /* ---------------- Fetch Products ---------------- */
  useEffect(() => {
    axios.get("/api/products").then((res) => {
      setProducts(res.data);
      setFilteredProducts(res.data);
    });
  }, []);

  /* ---------------- Fetch Categories ---------------- */
  useEffect(() => {
    axios.get("/api/categories").then((res) => setCategories(res.data));
  }, []);

  /* ---------------- Filter Products ---------------- */
  useEffect(() => {
    let result = products;

    if (searchProductQuery) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchProductQuery.toLowerCase())
      );
    }

    if (productCategoryFilter) {
      result = result.filter(
        (p) => p.categoryId === Number(productCategoryFilter)
      );
    }

    setFilteredProducts(result);
  }, [searchProductQuery, productCategoryFilter, products]);

  /* ---------------- Handlers ---------------- */
  const handleAddProduct = (product: any) => {
    if (!selectedProducts.find((p) => p.id === product.id)) {
      setSelectedProducts([
        ...selectedProducts,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          qty: 1,
        },
      ]);
    }
  };

  const handleRemoveProduct = (id: number) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== id));
  };

  const handleQtyChange = (id: number, qty: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, qty: qty < 1 ? 1 : qty } : p))
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  /* ---------------- Submit ---------------- */
  const onSubmit = async (data: any) => {
    if (selectedProducts.length < 2) {
      return toast.error("Please select at least 2 products");
    }

    if (!selectedCategories[0]) {
      return toast.error("Please select a category");
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description || "");
      formData.append("price", data.price.toString());
      formData.append("discount", (data.discount ?? 0).toString());
      formData.append("isFeatured", data.isFeatured ? "true" : "false");
      formData.append("isActive", data.isActive ? "true" : "false");

      if (selectedImage) formData.append("image", selectedImage);

      // Serialize products with quantities
      const productsData = selectedProducts.map(p => ({
        id: p.id,
        qty: p.qty
      }));
      formData.append("productsJson", JSON.stringify(productsData));
      formData.append("benefits", JSON.stringify(benefits));

      // Append standard productIds[] for fallback or direct indexing if needed
      selectedProducts.forEach((p) => {
        formData.append("productIds[]", p.id.toString());
      });

      formData.append("categoryId", selectedCategories[0].id.toString());

      await axios.post("/api/packages", formData, {
        headers: {
          Authorization: `Bearer ${Cookies.get("token") || ""}`,
        },
      });

      toast.success("Package created successfully");
      reset();
      setSelectedProducts([]);
      setSelectedCategories([]);
      setSelectedImage(null);
      setImagePreview(null);
      router.push("/admin/packages");
    } catch {
      toast.error("Failed to create package");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <ToastContainer position="top-right" autoClose={3000} />

      <Card>
        <CardHeader>
          <CardTitle>Add New Package</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Package Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Package Name</label>
                <Input {...register("name", { required: true })} />
              </div>

              <div>
                <label className="block mb-1 font-medium">Price</label>
                <Input
                  type="number"
                  {...register("price", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 font-medium">Discount (%)</label>
              <Input type="number" {...register("discount")} />
            </div>

            <div>
              <label className="block mb-1 font-medium">Description</label>
              <Textarea {...register("description")} />
            </div>

            {/* Image */}
            <div>
              <label className="block mb-2 font-medium">Package Image</label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Image
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>

                {imagePreview && (
                  <Image
                    src={imagePreview}
                    alt="preview"
                    width={80}
                    height={80}
                    className="rounded"
                  />
                )}
              </div>
            </div>

            {/* Package Category */}
            <div>
              <label className="block mb-1 font-medium">Package Category</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={selectedCategories[0]?.id || ""}
                onChange={(e) => {
                  const cat = categories.find(
                    (c) => c.id === Number(e.target.value)
                  );
                  setSelectedCategories(cat ? [cat] : []);
                }}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Search + Filter */}
            <div>
              <label className="block mb-2 font-medium">Select Products</label>

              <div className="grid md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block mb-1 text-sm font-medium">
                    Search Product
                  </label>
                  <Input
                    value={searchProductQuery}
                    onChange={(e) => setSearchProductQuery(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Filter by Category
                  </label>
                  <select
                    className="w-full border rounded px-2 py-2"
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product List */}
              <div className="max-h-48 overflow-y-auto border rounded mt-3">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex justify-between items-center p-2 border-b"
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        RS.{product.price}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      onClick={() => handleAddProduct(product)}
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>

              {/* Selected Products with Qty */}
              {selectedProducts.length > 0 && (
                <div className="mt-4">
                  <label className="block mb-2 font-medium">
                    Selected Products
                  </label>

                  {selectedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between border rounded p-2 mt-2"
                    >
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          RS.{product.price}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Qty</label>
                        <Input
                          type="number"
                          min={1}
                          value={product.qty}
                          onChange={(e) =>
                            handleQtyChange(product.id, Number(e.target.value))
                          }
                          className="w-20"
                        />
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveProduct(product.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {/* Benefits Section */}
              <div>
                <label className="block mb-2 font-medium">Package Benefits (Bullet Points)</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    placeholder="Enter a benefit (e.g. Free Shipping)"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddBenefit();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddBenefit} variant="outline">
                    Add
                  </Button>
                </div>

                {benefits.length > 0 && (
                  <ul className="space-y-2 mt-2 border rounded p-3">
                    {benefits.map((benefit, index) => (
                      <li key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span className="text-sm">• {benefit}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 h-6 px-2"
                          onClick={() => handleRemoveBenefit(index)}
                          type="button"
                        >
                          ✕
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Package..." : "Create Package"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
