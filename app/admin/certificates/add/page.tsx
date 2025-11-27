"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { usePost } from "@/services/usePost";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface CertificateType {
  title: string;
  image?: File | null;
}

export default function AddCertificatePage() {
  const router = useRouter();
  const [certificate, setCertificate] = useState<CertificateType>({
    title: "",
    image: null,
  });

  const { postData, loading, error } = usePost<FormData>("/api/certificates");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCertificate({ ...certificate, title: e.target.value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCertificate({ ...certificate, image: e.target.files[0] });
    }
  };

  const handleAddCertificate = async (e: FormEvent) => {
    e.preventDefault();
    const token = Cookies.get("token");

    if (!certificate.image) {
      toast.error("Please upload an image!");
      return;
    }

    const formData = new FormData();
    formData.append("title", certificate.title);
    formData.append("image", certificate.image);

    try {
      const res = await fetch("/api/certificates", {
        method: "POST",
        body: formData,
      });
      toast.success(" Certificate added successfully!");
      setCertificate({ title: "", image: null });
    } catch (err) {
      console.error(err);
      toast.error(error?.message || "Something went wrong. Please try again.");
    }
    router.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#f6f8fa] to-[#eaf2e3] font-poppins p-6">
      <ToastContainer />
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8 border border-[#d8e3c8] transition-all duration-300 hover:shadow-[#aec958]/40">
        <h1 className="text-3xl font-bold text-center text-[#2d3748] mb-6">
          Add Certificate
        </h1>

        <form onSubmit={handleAddCertificate} className="space-y-6">
          {/* Title Input */}
          <div>
            <label
              htmlFor="title"
              className="block text-gray-700 font-medium mb-2"
            >
              Certificate Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={certificate.title}
              onChange={handleInputChange}
              placeholder="Enter certificate title..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#aec958] focus:border-[#aec958] outline-none transition-all duration-200 text-gray-800"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label
              htmlFor="image"
              className="block text-gray-700 font-medium mb-2"
            >
              Certificate Image
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              required
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#aec958] file:text-white file:font-medium hover:file:bg-[#97b04c] cursor-pointer transition-all duration-200"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-lg transition-all duration-300 shadow-md cursor-pointer ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#4998d1] hover:bg-[#3b7aa8] text-white"
            }`}
          >
            {loading ? "Adding..." : "Add Certificate"}
          </button>

          {/* Back Button */}
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full py-2 text-[#4998d1] hover:text-[#3b7aa8] font-medium mt-2 transition-colors cursor-pointer"
          >
            ← Back to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
