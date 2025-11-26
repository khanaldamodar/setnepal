"use client";
import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RepairAndMaintence() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    product: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async () => {
    // Frontend validation
    if (!formData.name || !formData.phone || !formData.product) {
      toast.error("Name, Phone and Product are required");
      return;
    }

    try {
      // Convert to FormData
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      // Send as multipart/form-data
      const res = await axios.post("/api/repair", data);
      toast.success("Form submitted successfully!");
      setFormData({
        name: "",
        phone: "",
        address: "",
        product: "",
        message: "",
      });
    } catch (err: any) {
      toast.success(err.response?.data?.error || "Error submitting form");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center py-5">
      <form
        className="bg-white rounded-3xl w-full max-w-3xl p-6 mt-15 shadow-lg"
        onSubmit={(e) => e.preventDefault()}
      >
        <h2 className="text-black underline underline-offset-8 text-2xl font-bold mb-8 text-center">
          Repair and Maintenance
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="name"
            label="Name"
            value={formData.name}
            onChange={handleChange}
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
            fullWidth
            value={formData.address}
            onChange={handleChange}
          />
          <Input
            id="product"
            label="Product"
            fullWidth
            value={formData.product}
            onChange={handleChange}
          />
          <Input
            id="message"
            label="Message"
            fullWidth
            textarea
            value={formData.message}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-[#9bb648] text-white font-semibold py-2 px-10 rounded-xl text-lg transition hover:bg-[#8aa83d]"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ id, label, value, onChange, fullWidth, textarea }: any) {
  return (
    <div className={`flex flex-col ${fullWidth ? "md:col-span-2" : ""}`}>
      <label htmlFor={id} className="mb-1 text-gray-700 font-medium">
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          className="border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-[#9bb648] transition resize-none"
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          onChange={onChange}
          className="border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-[#9bb648] transition"
        />
      )}
    </div>
  );
}
