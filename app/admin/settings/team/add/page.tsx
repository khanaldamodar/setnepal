"use client";

import React, { useState } from "react";

export default function AddMemberPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [designation, setDesignation] = useState("");
  const [desc, setDesc] = useState("");
  const [email, setEmail] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("designation", designation);
    formData.append("desc", desc);
    formData.append("email", email);

    if (imageFile) {
      formData.append("photo", imageFile);
    }

    const res = await fetch("/api/members", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log("Response:", data);
  };

  return (
    <div className="flex min-h-screen justify-center p-10 font-poppins bg-gray-100">
      <main className="flex-1 max-w-4xl">
        <div className="bg-white shadow-md rounded-xl p-8">
          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            onSubmit={handleSubmit}
          >
            <h2 className="text-xl font-semibold text-gray-800 md:col-span-2">
              Add New Member
            </h2>

            <InputField label="Name" value={name} onChange={setName} />
            <InputField label="Phone" value={phone} onChange={setPhone} />

            <InputField
              label="Designation"
              value={designation}
              onChange={setDesignation}
            />
            <InputField
              label="Email"
              value={email}
              onChange={setEmail}
              type="email"
            />

            <TextareaField
              label="Description"
              value={desc}
              onChange={setDesc}
              className="md:col-span-2"
            />

            {/* Image Upload */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="font-medium">Profile Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImageFile(file);
                  setImagePreview(file ? URL.createObjectURL(file) : null);
                }}
              />

              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-24 w-24 object-cover rounded-full shadow-md mt-2 border"
                />
              )}
            </div>

            <div className="md:col-span-2 flex justify-center mt-6">
              <button
                type="submit"
                className="bg-[#aec958] hover:bg-[#9bb648] text-white px-6 py-2 rounded-md font-medium transition"
              >
                Add Member
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

// Reusable Input
const InputField = ({ label, type = "text", value, onChange }: any) => (
  <div className="flex flex-col gap-1">
    <label className="text-gray-700 text-sm font-medium">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-lime-500"
    />
  </div>
);

const TextareaField = ({ label, value, onChange, className }: any) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-gray-700 text-sm font-medium">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-lime-500 h-20 resize-y"
    />
  </div>
);
