"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { Search, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type SelectedProduct = {
  id: number;
  name: string;
  price: number;
  qty: number;
};

export default function EditPackagePage() {
  const router = useRouter();
  const params = useParams();
  const packageId = params.id;

  const { register, handleSubmit, setValue } = useForm();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
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

  // Fetch all products
  useEffect(() => {
    axios
      .get("/api/products")
      .then((res) => {
        setProducts(res.data);
        setFilteredProducts(res.data);
      })
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  // Fetch categories
  useEffect(() => {
    axios
      .get("/api/categories")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  // Fetch package details
  useEffect(() => {
    if (!packageId) return;
    axios
      .get(`/api/packages/${packageId}`)
      .then((res) => {
        const pkg = res.data;
        setValue("name", pkg.name);
        setValue("price", pkg.price);
        setValue("discount", pkg.discount);
        setValue("stock", pkg.stock);
        setValue("description", pkg.description);
        setValue("isFeatured", pkg.isFeatured);
        setValue("isActive", pkg.isActive);

        // Map packageProducts to selectedProducts with quantity
        if (pkg.packageProducts && Array.isArray(pkg.packageProducts)) {
          const mappedProducts = pkg.packageProducts.map((pp: any) => ({
            id: pp.product.id,
            name: pp.product.name,
            price: pp.product.price,
            qty: pp.quantity
          }));
          setSelectedProducts(mappedProducts);
        } else if (pkg.products && Array.isArray(pkg.products)) {
          // Fallback if data is old structure
          const mappedProducts = pkg.products.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            qty: 1
          }));
          setSelectedProducts(mappedProducts);
        }

        if (pkg.imageUrl) setImagePreview(pkg.imageUrl);
        setSelectedCategory(pkg.categoryId || null);

        if (pkg.benefits && Array.isArray(pkg.benefits)) {
          setBenefits(pkg.benefits);
        }
      })
      .catch((err) => console.error("Error fetching package:", err));
  }, [packageId, setValue]);

  // Filter products by search
  useEffect(() => {
    const results = products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(results);
  }, [searchQuery, products]);

  const handleAddProduct = (product: any) => {
    if (!selectedProducts.find((p) => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, { ...product, qty: 1 }]);
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

  const onSubmit = async (data: any) => {
    if (selectedProducts.length < 2) {
      toast.error("Please select at least 2 products");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("description", data.description || "");
      formData.append("price", data.price);
      formData.append("discount", data.discount || "0");
      formData.append("stock", data.stock || "0");
      formData.append("isFeatured", data.isFeatured ? "true" : "false");
      formData.append("isActive", data.isActive ? "true" : "false");

      if (selectedCategory) {
        formData.append("categoryId", selectedCategory.toString());
      }

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      // Serialize products with quantities
      const productsData = selectedProducts.map(p => ({
        id: p.id,
        qty: p.qty
      }));
      formData.append("productsJson", JSON.stringify(productsData));
      formData.append("benefits", JSON.stringify(benefits));

      // Fallback
      selectedProducts.forEach((p) => {
        formData.append("productIds[]", p.id.toString());
      });

      const token = Cookies.get("token") || "";

      await axios.put(`/api/packages/${packageId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Package updated successfully");
      router.push("/admin/packages");
    } catch (error: any) {
      console.error("Error updating package:", error.response?.data);
      toast.error("Failed to update package");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <ToastContainer position="top-right" autoClose={3000} />
      <Card className="shadow-md border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Edit Package</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name & Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col">
                <span className="mb-1 font-medium">Package Name</span>
                <Input
                  {...register("name", { required: true })}
                  placeholder="Package Name"
                />
              </label>

              <label className="flex flex-col">
                <span className="mb-1 font-medium">Price</span>
                <Input
                  {...register("price", { required: true })}
                  type="number"
                  placeholder="Price"
                />
              </label>
            </div>

            {/* Discount & Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col">
                <span className="mb-1 font-medium">Discount %</span>
                <Input
                  {...register("discount")}
                  type="number"
                  placeholder="Discount %"
                />
              </label>

              <label className="flex flex-col">
                <span className="mb-1 font-medium">Stock</span>
                <Input
                  {...register("stock")}
                  type="number"
                  placeholder="Stock"
                />
              </label>
            </div>

            {/* Description */}
            <label className="flex flex-col">
              <span className="mb-1 font-medium">Description</span>
              <Textarea
                {...register("description")}
                placeholder="Package Description"
                rows={3}
              />
            </label>

            {/* Image Upload */}
            <div className="flex flex-col md:flex-row items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Upload className="w-5 h-5 text-gray-600" />
                <span>Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>

              {imagePreview && (
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={100}
                  height={100}
                  className="rounded-lg object-cover"
                />
              )}
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register("isFeatured")} /> Featured
              </label>

              <label className="flex items-center gap-2">
                <input type="checkbox" {...register("isActive")} /> Active
              </label>
            </div>

            {/* Category Dropdown */}
            <div className="mt-6">
              <label className="block mb-2 font-medium">Category</label>
              <select
                name="categoryId"
                value={selectedCategory || ""}
                onChange={(e) => setSelectedCategory(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value=""></option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Select Products</h3>

              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search product..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="max-h-48 overflow-y-auto border rounded-md p-2">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between py-2 border-b last:border-none"
                    >
                      <span>{product.name}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddProduct(product)}
                      >
                        Add
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center">
                    No products found
                  </p>
                )}
              </div>

              {selectedProducts.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Selected Products</h4>
                  <div className="space-y-2">
                    {selectedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between bg-gray-50 border rounded-md p-2"
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
                            onChange={(e) => handleQtyChange(product.id, Number(e.target.value))}
                            className="w-20 h-8"
                          />
                          <Trash2
                            className="w-5 h-5 text-red-500 cursor-pointer ml-2"
                            onClick={() => handleRemoveProduct(product.id)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Benefits Section */}
            <div className="mt-6">
              <label className="block mb-2 font-medium">Package Benefits (Bullet Points)</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  placeholder="Enter a benefit"
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

            <Button type="submit" className="w-full mt-6" disabled={loading}>
              {loading ? "Updating Package..." : "Update Package"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
