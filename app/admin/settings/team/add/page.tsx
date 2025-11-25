"use client";

import React, { useState } from "react";

export default function AddMemberForm() {
  // Personal Info
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [designation, setDesignation] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Optional Social Links
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newMemberData = {
      name,
      phone,
      designation,
      description,
      imageFile,
      facebook,
      instagram,
      linkedin,
      email,
    };

    console.log("New Member Added:", newMemberData);
    // Send `newMemberData` to backend here
  };

  return (
    <div className="flex min-h-screen justify-center font-poppins bg-gray-50 p-6">
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
              value={description}
              onChange={setDescription}
              className="md:col-span-2"
            />

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
                  alt="Profile preview"
                  className="h-24 w-24 object-cover rounded-full shadow-md mt-2 border border-gray-300"
                />
              )}
            </div>

            <h2 className="text-xl font-semibold text-gray-800 md:col-span-2 mt-6">
              Social Links (Optional)
            </h2>

            <InputField
              label="Facebook"
              value={facebook}
              onChange={setFacebook}
            />
            <InputField
              label="Instagram"
              value={instagram}
              onChange={setInstagram}
            />
            <InputField
              label="LinkedIn"
              value={linkedin}
              onChange={setLinkedin}
            />

            <div className="md:col-span-2 flex justify-center mt-8">
              <button
                type="submit"
                className="bg-[#aec958] hover:bg-[#9bb648] text-white px-6 py-2.5 rounded-md font-medium text-sm transition"
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

// Reusable Input & Textarea
const InputField = ({ label, type = "text", value, onChange }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-gray-700 text-sm font-medium">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-300 rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 transition"
    />
  </div>
);

const TextareaField = ({ label, value, onChange, className }: any) => (
  <div className={`flex flex-col gap-1.5 ${className || ""}`}>
    <label className="text-gray-700 text-sm font-medium">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-300 rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 transition resize-y h-20"
    />
  </div>
);
