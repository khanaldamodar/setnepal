"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  categoryId: number;
  price: number;
  brand?: { id: number; name: string } | "N/A";
}

interface SelectedProduct {
  productId: number;
  quantity: number;
}

interface Selection {
  category: Category | null;
  products: SelectedProduct[];
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

  const [searchQueries, setSearchQueries] = useState<string[]>([""]);
  const [currentPages, setCurrentPages] = useState<number[]>([1]);

  // Fetch categories & products
  useEffect(() => {
    axios.get("/api/categories").then((res) => setCategories(res.data));
    axios.get("/api/products").then((res) => setProducts(res.data));
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleNextStep1 = () => {
    const { name, email, phone, organization, address } = formData;
    if (!name || !email || !phone || !organization || !address) {
      toast.error("Please fill all required fields.");
      return;
    }
    setStep(2);
  };

  const handleCategoryChange = (index: number, categoryId: string) => {
    const category =
      categories.find((c) => c.id === Number(categoryId)) || null;
    const newSelections = [...selections];
    newSelections[index] = { category, products: [] };
    setSelections(newSelections);

    const newSearch = [...searchQueries];
    newSearch[index] = "";
    setSearchQueries(newSearch);

    const newPages = [...currentPages];
    newPages[index] = 1;
    setCurrentPages(newPages);
  };

  const handleProductToggle = (index: number, productId: number) => {
    const newSelections = [...selections];
    const productsArr = newSelections[index].products;

    const existing = productsArr.find((p) => p.productId === productId);

    if (existing) {
      // Remove product
      newSelections[index].products = productsArr.filter(
        (p) => p.productId !== productId
      );
    } else {
      // Add product with default quantity 1
      newSelections[index].products.push({ productId, quantity: 1 });
    }

    setSelections(newSelections);
  };

  const addSelection = () => {
    setSelections([...selections, { category: null, products: [] }]);
    setSearchQueries([...searchQueries, ""]);
    setCurrentPages([...currentPages, 1]);
  };

  const undoSelection = () => {
    setSelections(selections.slice(0, -1));
    setSearchQueries(searchQueries.slice(0, -1));
    setCurrentPages(currentPages.slice(0, -1));
  };

  const handleNextStep2 = () => {
    if (!selections.every((sel) => sel.category && sel.products.length > 0)) {
      toast.error("Please complete all selections.");
      return;
    }
    setStep(3);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const { name, email, phone, organization, address } = formData;
      if (!name || !organization || !address) {
        toast.error("Please fill all required fields.");
        return;
      }

      // Prepare items
      const items = selections.flatMap((sel) =>
        sel.products.map((p) => {
          const prod = products.find((prod) => prod.id === p.productId);
          return {
            category: sel.category?.name ?? "N/A",
            productId: p.productId,
            productName: prod?.name ?? "N/A",
            brandName: prod?.brand?.name ?? "N/A",
            quantity: p.quantity,
            unitPrice: prod?.price ?? 0,
            subtotal: (prod?.price ?? 0) * p.quantity,
          };
        })
      );

      if (items.length === 0) {
        toast.error("Please select at least one product.");
        return;
      }

      const res = await axios.post("/api/quotation", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        companyName: formData.organization,
        message: formData.message,
        items,
      });

      toast.success(res.data.message || "Quotation submitted successfully!");

      // PDF Starts
      const doc = new jsPDF("p", "pt", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const leftX = 40;
      const rightX = pageWidth - 200;

      // Header images
      if (typeof window !== "undefined") {
        const logo = new Image();
        logo.src = "/logo.jpeg";

        const quality = new Image();
        quality.src = "/qualityAssured.png";

        doc.addImage(logo, "JPEG", leftX, 20, 230, 150);
        doc.addImage(quality, "PNG", rightX, 20, 140, 120);

        doc.setFontSize(9);
        doc.text("Set Nepal", leftX, 170);
        doc.text("Bafal Kathmandu", leftX, 185);
        doc.text("01-5312298", leftX, 200);

        doc.text("Contact No: 123456", rightX, 170);
        doc.text("Email: info@example.com", rightX, 185);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, rightX, 200);
      }

      // Boxes
      const boxY = 230;
      const boxH = 90;
      const boxW = (pageWidth - leftX * 2 - 20) / 2;

      doc.rect(leftX, boxY, boxW, boxH);
      doc.setFontSize(10);
      doc.text("Customer Info:", leftX + 10, boxY + 20);
      doc.text(`Organization: ${formData.organization}`, leftX + 10, boxY + 35);
      doc.text(`Name: ${formData.name}`, leftX + 10, boxY + 50);
      doc.text(`Address: ${formData.address}`, leftX + 10, boxY + 65);

      doc.rect(leftX + boxW + 20, boxY, boxW, boxH);
      doc.setFontSize(24);
      doc.text("Quotation", leftX + boxW + 20 + boxW / 2, boxY + boxH / 2, {
        align: "center",
      });

      // Items table
      const tableData = items.map((item, idx) => [
        idx + 1,
        item.productName,
        item.brandName,
        "pcs",
        item.quantity,
        item.unitPrice.toFixed(2),
        item.subtotal.toFixed(2),
      ]);

      autoTable(doc, {
        startY: boxY + boxH + 30,
        head: [
          ["SN", "Description", "Brand", "Unit", "Qty", "Unit Price", "Total"],
        ],
        body: tableData,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [200, 200, 200] },
        columnStyles: {
          0: { halign: "center" },
          3: { halign: "center" },
          4: { halign: "center" },
          5: { halign: "right" },
          6: { halign: "right" },
        },
      });

      let lastY = doc.lastAutoTable.finalY + 20;

      // Notes
      autoTable(doc, {
        startY: lastY,
        head: [
          [
            {
              content: "Notes & Special Comments:",
              styles: { halign: "center" },
            },
          ],
        ],
        body: [
          ["• The Quoted price is inclusive of all applicable taxes and VAT"],
          ["• Payment: 100% within 7 days after delivery."],
          ["• Delivery and Installation will be free of cost"],
          ["• Delivery: Within 5–15 Days of PO acceptance"],
          ["• Validity of Quotation: 30 Days"],
        ],
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: [200, 200, 200], fontStyle: "bold" },
        columnStyles: { 0: { cellWidth: pageWidth - leftX * 2 } },
      });

      lastY = doc.lastAutoTable.finalY + 20;

      // Warranty
      autoTable(doc, {
        startY: lastY,
        head: [
          [
            {
              content: "Warranty Terms and Conditions:",
              styles: { halign: "center" },
            },
          ],
        ],
        body: [
          ["• In case of payment failure, warranty isn't applicable."],
          ["• NEA voltage fluctuation damage is not covered."],
          ["• Physical damage or tampering voids warranty."],
        ],
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: [200, 200, 200], fontStyle: "bold" },
        columnStyles: { 0: { cellWidth: pageWidth - leftX * 2 } },
      });

      lastY = doc.lastAutoTable.finalY + 25;

      // Closing text
      doc.setFontSize(10);
      const closingText =
        "We will be happy to supply any further information you may need and trust that you call on us to fill your order, which will receive our attention promptly.";
      const wrapped = doc.splitTextToSize(closingText, pageWidth - leftX * 2);
      doc.text(wrapped, leftX, lastY);

      // ---------------------------------------------
      // UPDATED SIGNATURE SECTION (Left text + Right stamp)
      // ---------------------------------------------
      lastY += wrapped.length * 12 + 30;
      let sigY = lastY;

      // LEFT SIDE TEXT
      doc.setFontSize(10);
      doc.text(
        "To accept this quotation, please sign here and return:",
        leftX,
        sigY
      );

      sigY += 40;

      // RIGHT SIDE STAMP
      const stamp = new Image();
      stamp.src = "/setNepalStamp.png";

      const stampWidth = 120;
      const stampHeight = 80;

      const rightXStamp = pageWidth - leftX - stampWidth;

      doc.addImage(stamp, "PNG", rightXStamp, sigY, stampWidth, stampHeight);

      // RIGHT SIDE TEXT BELOW STAMP
      doc.setFontSize(12);
      doc.text("For: Set Nepal Pvt. Ltd", rightXStamp, sigY + stampHeight + 20);

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
      setSearchQueries([""]);
      setCurrentPages([1]);
      setStep(1);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Submission failed");
      console.error(err);
    }
  };

  const productsByCategory = (categoryId: number) =>
    products.filter((p) => p.categoryId === categoryId);

  return (
    <div className="mt-16 font-poppins min-h-screen pb-12">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      {/* Step 1 */}
      {step === 1 && (
        <div className="flex justify-center px-4">
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl p-6">
            <Stepper current={1} />
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Personal Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingInput
                id="organization"
                label="Organization"
                value={formData.organization}
                onChange={handleChange}
              />
              <FloatingInput
                id="name"
                label="Name"
                value={formData.name}
                onChange={handleChange}
              />
              <FloatingInput
                id="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
              <FloatingInput
                id="phone"
                label="Phone"
                value={formData.phone}
                onChange={handleChange}
              />
              <FloatingInput
                id="address"
                label="Address"
                fullWidth
                value={formData.address}
                onChange={handleChange}
              />
              <FloatingInput
                id="message"
                label="Message"
                textarea
                fullWidth
                value={formData.message}
                onChange={handleChange}
              />
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={handleNextStep1}
                className="bg-[#9bb648] text-white py-2 px-6 rounded-lg font-semibold hover:opacity-90"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="flex justify-center px-4">
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl p-6">
            <Stepper current={2} />
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Quotation Details
            </h2>

            {selections.map((sel, index) => {
              const rawProducts = productsByCategory(sel.category?.id || 0);
              const filteredProducts = rawProducts.filter((p) =>
                p.name
                  .toLowerCase()
                  .includes(searchQueries[index].toLowerCase())
              );

              const PAGE_SIZE = 10;
              const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
              const start = (currentPages[index] - 1) * PAGE_SIZE;
              const paginatedProducts = filteredProducts.slice(
                start,
                start + PAGE_SIZE
              );

              return (
                <div
                  key={index}
                  className="mb-6 border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <label className="block text-gray-700 font-medium mb-2">
                    Category
                  </label>
                  <select
                    value={sel.category?.id || ""}
                    onChange={(e) =>
                      handleCategoryChange(index, e.target.value)
                    }
                    className="w-full p-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#9bb648] outline-none mb-2"
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  {sel.category && (
                    <>
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQueries[index]}
                        onChange={(e) => {
                          const updated = [...searchQueries];
                          updated[index] = e.target.value;
                          setSearchQueries(updated);
                          const updatedPages = [...currentPages];
                          updatedPages[index] = 1;
                          setCurrentPages(updatedPages);
                        }}
                        className="w-full mb-2 p-2 border rounded-lg focus:ring-2 focus:ring-[#9bb648]"
                      />

                      <p className="text-gray-700 font-medium mb-2">Products</p>
                      {paginatedProducts.length === 0 ? (
                        <p className="text-gray-500">No products found.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {paginatedProducts.map((product) => {
                            const selectedProduct = sel.products.find(
                              (p) => p.productId === product.id
                            );

                            return (
                              <div
                                key={product.id}
                                className={`px-3 py-1 rounded-full border flex items-center gap-1 ${
                                  selectedProduct
                                    ? "bg-[#9bb648] text-white border-[#9bb648]"
                                    : "bg-white border-gray-300 text-gray-700"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={!!selectedProduct}
                                  onChange={() =>
                                    handleProductToggle(index, product.id)
                                  }
                                />
                                <span>
                                  {product.name} — Rs. {product.price}
                                </span>

                                {selectedProduct && (
                                  <input
                                    type="number"
                                    min={1}
                                    value={selectedProduct.quantity}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const newSelections = [...selections];
                                      newSelections[index].products.find(
                                        (p) => p.productId === product.id
                                      )!.quantity = val;
                                      setSelections(newSelections);
                                    }}
                                    className="w-16 border rounded px-2 py-1 text-sm ml-2"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {totalPages > 1 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                          ).map((page) => (
                            <button
                              key={page}
                              type="button"
                              onClick={() => {
                                const updated = [...currentPages];
                                updated[index] = page;
                                setCurrentPages(updated);
                              }}
                              className={`px-2 py-1 rounded-md border text-sm ${
                                currentPages[index] === page
                                  ? "bg-[#9bb648] text-white border-[#9bb648]"
                                  : "bg-white text-gray-700 border-gray-300"
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}

            <div className="flex items-center mb-4">
              {selections.at(-1)?.category &&
                selections.at(-1)?.products.length! > 0 && (
                  <button
                    type="button"
                    onClick={addSelection}
                    className="bg-[#9bb648] text-white py-1 px-3 rounded-lg font-semibold hover:opacity-90"
                  >
                    + Add Category
                  </button>
                )}
              {selections.length > 1 && (
                <button
                  type="button"
                  className="ml-2 bg-red-500 text-white py-1 px-3 rounded-lg font-semibold"
                  onClick={undoSelection}
                >
                  Remove
                </button>
              )}
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="bg-gray-200 text-black py-2 px-6 rounded-lg font-semibold"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleNextStep2}
                className="bg-[#9bb648] text-white py-2 px-6 rounded-lg font-semibold hover:opacity-90"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {/* Step 3 */}
      {step === 3 && (
        <div className="flex justify-center px-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-3xl bg-white rounded-xl shadow-xl p-6"
          >
            <Stepper current={3} />
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Review & Submit
            </h2>

            {/* Selected Products */}
            {selections.map((sel, index) => (
              <div
                key={index}
                className="mb-4 border p-3 rounded-lg bg-gray-50"
              >
                <p className="font-semibold text-gray-700">
                  Category: {sel.category?.name}
                </p>
                <ul className="list-disc list-inside">
                  {sel.products.map((p) => {
                    const prod = products.find(
                      (prod) => prod.id === p.productId
                    );
                    return prod ? (
                      <li key={p.productId}>
                        {prod.name} — Rs. {prod.price} × {p.quantity}
                      </li>
                    ) : null;
                  })}
                </ul>
              </div>
            ))}

            {/* Notes or Special Comments */}
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-bold text-gray-700 mb-2">
                Notes or Special Comments
              </h3>
              <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                <li>
                  The Quoted price is inclusive of all applicable taxes and VAT
                </li>
                <li>Payment: 100% within 7 days after delivery.</li>
                <li>Delivery and Installation will be free of cost</li>
                <li>
                  Delivery: Within 5-15 Days of receiving and acceptance of
                  purchase order
                </li>
                <li>Validity of Quotation: 30 Days</li>
              </ul>
              <br />

              <h3 className="font-bold text-gray-700 mb-2">
                Warranty Terms and Conditions
              </h3>
              <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                <li>
                  In case of payment failure as per the predetermined agreement
                  and quotation, warranty isn’t applicable
                </li>
                <li>
                  NEA voltage fluctuation issue is not covered under warranty on
                  Electric & Electronic Product.
                </li>
                <li>
                  Physical damage, mishandling, alteration of serial number is
                  not covered under warranty
                </li>
              </ul>
            </div>
            <p>
              <i className="text-sm">
                We will be happy to supply any further information you may need
                and trust that you call on us to fill your order, which will
                receive our attention promptly.
              </i>
            </p>

            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-gray-200 text-black py-2 px-6 rounded-lg font-semibold"
              >
                ← Back
              </button>
              <button
                type="submit"
                className="bg-[#9bb648] text-white py-2 px-6 rounded-lg font-semibold hover:opacity-90"
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

// FloatingInput Component
const FloatingInput = ({
  id,
  label,
  value,
  onChange,
  textarea,
  fullWidth,
  type = "text",
}: any) => (
  <div className={`relative ${fullWidth ? "col-span-2" : ""}`}>
    {textarea ? (
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        className="peer w-full border rounded px-3 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9bb648]"
      />
    ) : (
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className="peer w-full border rounded px-3 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9bb648]"
      />
    )}
    <label
      htmlFor={id}
      className="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-gray-700 peer-focus:text-sm"
    >
      {label}
    </label>
  </div>
);

// Stepper
const Stepper = ({ current }: { current: number }) => (
  <div className="flex items-center justify-between mb-6">
    {[1, 2, 3].map((step) => (
      <div
        key={step}
        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
          current === step
            ? "bg-[#9bb648] text-white"
            : current > step
            ? "bg-green-200 text-white"
            : "bg-gray-200 text-gray-500"
        }`}
      >
        {step}
      </div>
    ))}
  </div>
);
