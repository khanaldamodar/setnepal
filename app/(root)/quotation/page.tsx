"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Heading from "@/components/global/Heading";
import { jsPDF } from "jspdf";

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  categoryId: number;
  price: number;
}

interface Selection {
  category: Category | null;
  products: number[];
}

export default function Quotation() {
  const [step, setStep] = useState<number>(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [formData, setFormData] = useState({
    organization: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    message: "",
  });

  const [selections, setSelections] = useState<Selection[]>([
    { category: null, products: [] },
  ]);

  // Fetch categories and products
  useEffect(() => {
    axios.get("/api/categories").then((res) => setCategories(res.data));
    axios.get("/api/products").then((res) => setProducts(res.data));
  }, []);

  // Input change handler
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setFormData({ ...formData, [e.target.id]: e.target.value });

  // Step 1 validation
  const handleNext = () => {
    const { name, email, phone, organization, address } = formData;
    if (!name || !email || !phone || !organization || !address) {
      toast.error("Please fill all required fields.");
      return;
    }
    setStep(2);
  };

  // Category change
  const handleCategoryChange = (index: number, categoryId: string) => {
    const category =
      categories.find((c) => c.id === Number(categoryId)) || null;
    const newSelections = [...selections];
    newSelections[index] = { category, products: [] };
    setSelections(newSelections);
  };

  // Product toggle
  const handleProductToggle = (index: number, productId: number) => {
    const newSelections = [...selections];
    const productsArr = newSelections[index].products;
    if (productsArr.includes(productId)) {
      newSelections[index].products = productsArr.filter(
        (p) => p !== productId
      );
    } else {
      newSelections[index].products.push(productId);
    }
    setSelections(newSelections);
  };

  const addSelection = () =>
    setSelections([...selections, { category: null, products: [] }]);
  const undoSelection = () => setSelections(selections.slice(0, -1));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate that all selections have a category and at least one product
    if (!selections.every((sel) => sel.category && sel.products.length > 0)) {
      toast.error("Please complete all selections.");
      return;
    }

    // Build items safely, filter out undefined products
    const items = selections.flatMap(
      (sel) =>
        sel.products
          .map((pid) => {
            const product = products.find((p) => p.id === pid);
            if (!product) return null; // skip invalid product
            return {
              productId: product.id, // for backend
              name: product.name, // for PDF
              price: product.price,
              quantity: 1,
            };
          })
          .filter(Boolean) // remove nulls
    ) as { productId: number; name: string; price: number; quantity: number }[];

    if (items.length === 0) {
      toast.error("Please select at least one valid product.");
      return;
    }

    try {
      // Submit to backend
      await axios.post("/api/quotation", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        companyName: formData.organization,
        message: formData.message,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })), // only send what backend needs
      });

      toast.success("Quotation submitted successfully!");

      // Generate PDF
      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.text("Quotation", 105, 20, { align: "center" });

      // Customer info
      doc.setFontSize(12);
      let y = 35;
      doc.text(`Name: ${formData.name}`, 20, y);
      y += 7;
      doc.text(`Organization: ${formData.organization}`, 20, y);
      y += 7;
      doc.text(`Email: ${formData.email}`, 20, y);
      y += 7;
      doc.text(`Phone: ${formData.phone}`, 20, y);
      y += 7;
      doc.text(`Address: ${formData.address}`, 20, y);
      if (formData.message) {
        y += 7;
        doc.text(`Message: ${formData.message}`, 20, y);
      }

      // Table header
      y += 15;
      doc.setFontSize(14);
      doc.text("Items", 20, y);
      y += 7;

      doc.setFontSize(12);
      doc.text("No", 20, y);
      doc.text("Product Name", 35, y);
      doc.text("Qty", 130, y);
      doc.text("Price", 150, y);

      y += 5;
      doc.line(20, y, 190, y); // horizontal line
      y += 7;

      // Table rows
      let grandTotal = 0;
      items.forEach((item, index) => {
        const total = item.price * item.quantity;
        grandTotal += total;

        doc.text(`${index + 1}`, 20, y);
        doc.text(item.name, 35, y);
        doc.text(`${item.quantity}`, 130, y);
        doc.text(`Rs. ${item.price.toFixed(2)}`, 150, y);

        y += 7;
      });

      // Grand total
      y += 5;
      doc.line(120, y, 190, y); // line above total
      y += 7;
      doc.setFontSize(12);
      doc.text(`Grand Total: Rs. ${grandTotal.toFixed(2)}`, 150, y);

      // Save PDF
      doc.save("quotation.pdf");

      // Reset form
      setFormData({
        organization: "",
        name: "",
        email: "",
        phone: "",
        address: "",
        message: "",
      });
      setSelections([{ category: null, products: [] }]);
      setStep(1);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Submission failed");
      console.error(err);
    }
  };

  const productsByCategory = (categoryId: number) =>
    products.filter((p) => p.categoryId === categoryId);

  return (
    <div className="mt-20 font-poppins font-semibold min-h-screen py-10">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <div className="text-center mb-4">
        <Heading title="Quotation" />
      </div>

      {step === 1 && (
        <div className="flex justify-center items-start">
          <form className="bg-white rounded-3xl w-full max-w-3xl p-10 shadow-lg">
            <h2 className="text-black underline underline-offset-8 text-2xl font-bold mb-8">
              Personal Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                id="organization"
                label="Organization"
                value={formData.organization}
                onChange={handleChange}
              />
              <Input
                id="name"
                label="Name"
                value={formData.name}
                onChange={handleChange}
              />
              <Input
                id="email"
                label="Email"
                value={formData.email}
                onChange={handleChange}
                type="email"
              />
              <Input
                id="phone"
                label="Phone"
                value={formData.phone}
                onChange={handleChange}
              />
              <Input
                id="address"
                label="Address"
                value={formData.address}
                onChange={handleChange}
                fullWidth
              />
              <Input
                id="message"
                label="Message"
                value={formData.message}
                onChange={handleChange}
                fullWidth
                textarea
              />
            </div>

            <div className="flex justify-end mt-8">
              <button
                type="button"
                onClick={handleNext}
                className="bg-[#9bb648] text-white font-semibold py-3 px-8 rounded-xl transition"
              >
                Next
              </button>
            </div>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="flex justify-center items-start mt-10">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl w-full max-w-3xl p-10 shadow-lg"
          >
            <h2 className="text-black underline underline-offset-8 text-2xl font-bold mb-6">
              Quotation Details
            </h2>

            {selections.map((sel, index) => (
              <div key={index} className="mb-6 border p-4 rounded-lg">
                <div className="mb-4">
                  <label className="block mb-2 font-medium">Category</label>
                  <select
                    value={sel.category?.id || ""}
                    onChange={(e) =>
                      handleCategoryChange(index, e.target.value)
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {sel.category && (
                  <div>
                    <label className="block mb-2 font-medium">Products</label>
                    {productsByCategory(sel.category.id).length === 0 ? (
                      <p className="text-gray-500">No products available</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {productsByCategory(sel.category.id).map((product) => (
                          <label
                            key={product.id}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="checkbox"
                              checked={sel.products.includes(product.id)}
                              onChange={() =>
                                handleProductToggle(index, product.id)
                              }
                            />
                            {product.name} (Rs. {product.price})
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            <div className="flex items-center mb-6">
              {selections[selections.length - 1].category &&
                selections[selections.length - 1].products.length > 0 && (
                  <button
                    type="button"
                    onClick={addSelection}
                    className="bg-[#9bb648] text-white font-semibold py-2 px-6 rounded-xl transition"
                  >
                    + Add Category
                  </button>
                )}
              {selections.length > 1 && (
                <button
                  type="button"
                  onClick={undoSelection}
                  className="ml-4 bg-red-500 text-white font-semibold py-2 px-6 rounded-xl transition"
                >
                  - Remove
                </button>
              )}
            </div>

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="bg-gray-300 text-black font-semibold py-3 px-8 rounded-xl transition"
              >
                Back
              </button>
              <button
                type="submit"
                className="bg-[#9bb648] text-white font-semibold py-3 px-8 rounded-xl transition"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// Simple input component
function Input({
  id,
  label,
  value,
  onChange,
  fullWidth,
  type = "text",
  textarea,
}: any) {
  return (
    <div className={`flex flex-col ${fullWidth ? "md:col-span-2" : ""}`}>
      <label htmlFor={id} className="mb-2 text-gray-700 font-medium">
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          className="border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-[#9bb648] transition"
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          className="border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-[#9bb648] transition"
        />
      )}
    </div>
  );
}
