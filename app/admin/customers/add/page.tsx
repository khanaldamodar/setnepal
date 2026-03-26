"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { usePost } from "@/services/usePost";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface CustomerType {
  organization_name?: string;
  contact_person_name: string;
  contact_person_email?: string;
  contact_person_phone?: string;
  email?: string;
  phone?: string;
  address?: string;
  leadSource?: string;
  tags?: string;
  note?: string;
  status?: string;
}

export default function AddCustomerPage() {
  const router = useRouter();

  const [customer, setCustomer] = useState<CustomerType>({
    organization_name: "",
    contact_person_name: "",
    contact_person_email: "",
    contact_person_phone: "",
    email: "",
    phone: "",
    address: "",
    leadSource: "",
    tags: "",
    note: "",
    status: "NEW",
  });

  const { postData, loading, error } = usePost<CustomerType>("/api/customers");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setCustomer({
      ...customer,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = Cookies.get("token");

    try {
      const payload = {
        ...customer,
        tags: customer.tags
          ? customer.tags.split(",").map((t) => t.trim())
          : [],
      };

      await postData(payload, token);

      toast.success("Customer added successfully!");

      setCustomer({
        organization_name: "",
        contact_person_name: "",
        contact_person_email: "",
        contact_person_phone: "",
        email: "",
        phone: "",
        address: "",
        leadSource: "",
        tags: "",
        note: "",
        status: "NEW",
      });
    } catch (err) {
      console.error(err);
      toast.error(error?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 shadow rounded-xl mt-6">
      <h1 className="text-2xl font-semibold mb-4">Add Customer</h1>

      <form onSubmit={handleAddCustomer} className="space-y-4">
        <InputField
          label="Organization Name *"
          name="organization_name"
          value={customer.organization_name}
          onChange={handleChange}
          required
        />

        <InputField
          label="Email"
          name="email"
          value={customer.email}
          onChange={handleChange}
        />

        <InputField
          label="Phone"
          name="phone"
          value={customer.phone}
          onChange={handleChange}
        />

        <InputField
          label="Contact Person Name *"
          name="contact_person_name"
          value={customer.contact_person_name}
          onChange={handleChange}
          required
        />
        {/* <InputField label="Contact Person Email" name="contact_person_email" value={customer.contact_person_email} onChange={handleChange} /> */}

        <InputField
          label="Contact Person Phone"
          name="contact_person_phone"
          value={customer.contact_person_phone}
          onChange={handleChange}
        />

        <InputField
          label="Address"
          name="address"
          value={customer.address}
          onChange={handleChange}
        />

        {/* lead source */}
        <SelectField
          label="Lead Source"
          name="leadSource"
          value={customer.leadSource}
          onChange={handleChange}
          options={["WEBSITE", "MANUAL", "REFERRAL"]}
        />

        {/* status */}
        <SelectField
          label="Customer Status"
          name="status"
          value={customer.status}
          onChange={handleChange}
          options={[
            "NEW",
            "CONTACTED",
            "INTERESTED",
            "NOT_INTERESTED",
            "CONVERTED",
          ]}
        />

        <InputField
          label="Tags (comma separated)"
          name="tags"
          value={customer.tags}
          onChange={handleChange}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Note</label>
          <textarea
            name="note"
            value={customer.note}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#aec958]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#aec958] hover:bg-[#99b84f] text-white font-semibold py-3 rounded-md transition"
        >
          {loading ? "Adding..." : "Add Customer"}
        </button>
      </form>

      <button
        onClick={() => router.back()}
        className="mt-4 w-full text-center text-sm text-[#4998d1] font-semibold hover:underline"
      >
        ← Back
      </button>
    </div>
  );
}

// resuable input
function InputField({ label, name, value, onChange, required = false }: any) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type="text"
        name={name}
        required={required}
        value={value || ""}
        onChange={onChange}
        className="p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#aec958]"
      />
    </div>
  );
}

// select field
function SelectField({ label, name, value, onChange, options }: any) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className="p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#aec958]"
      >
        <option value="">Select {label}</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
