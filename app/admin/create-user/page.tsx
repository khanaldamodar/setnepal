"use client";

import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CreateNewUserPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("ADMIN");
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill all required fields!");
      return;
    }

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address!");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const formData = {
      name,
      email,
      password,
      phone,
      address,
      role,
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to Create user");
        return;
      }

      toast.success("User created successfully!");

      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setPhone("");
      setAddress("");
      setRole("ADMIN");
    } catch (error) {
      toast.error("Something went wrong!");
    }

    if (!name || !email || !password || !confirmPassword) {
      setErrors({
        name: !name,
        email: !email,
        password: !password,
        confirmPassword: !confirmPassword,
      });
      toast.error("Please fill all required fields!");
      return;
    }
  };

  return (
    <div className="flex min-h-screen justify-center md:p-10 font-poppins bg-gray-100">
      <main className="flex-1 max-w-4xl">
        <div className="bg-white shadow-md rounded-xl p-8">
          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            onSubmit={handleSubmit}
          >
            <h2 className="text-xl font-semibold text-gray-800 md:col-span-2">
              Create User
            </h2>

            <InputField
              label="Name"
              value={name}
              onChange={setName}
              error={errors.name}
              required
            />
            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              error={errors.email}
              required
            />
            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              error={errors.password}
              required
            />
            <InputField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              error={errors.confirmPassword}
              required
            />

            <InputField label="Phone" value={phone} onChange={setPhone} />
            <InputField label="Address" value={address} onChange={setAddress} />

            {/* Role select */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-gray-700 text-sm font-medium">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-lime-500"
              >
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-center mt-6">
              <button
                type="submit"
                className="bg-[#aec958] hover:bg-[#9bb648] text-white px-6 py-2 rounded-md font-medium transition cursor-pointer"
              >
                Create User
              </button>
            </div>
          </form>
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}

const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  error,
  required = false,
}: any) => (
  <div className="flex flex-col gap-1">
    <label className="text-gray-700 text-sm font-medium">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`border rounded-md p-2 text-sm focus:ring-2 focus:ring-lime-500 ${
        error ? "border-red-500 focus:ring-red-500" : "border-gray-300"
      }`}
    />
  </div>
);
