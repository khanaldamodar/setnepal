"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
// interface

interface Customer {
  organization_name: string;
  contact_person_name: string;
  contact_person_email: string;
  contact_person_phone: string;
  email: string;
  phone: string;
  address: string;
  leadSource: string;
  tags: string;
  note: string;
  status: "NEW" | "CONTACTED" | "INTERESTED" | "NOT_INTERESTED" | "CONVERTED";
}

interface InputFieldProps {
  label: string;
  name: keyof Customer;
  value: string;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  required?: boolean;
}

interface SelectFieldProps {
  label: string;
  name: keyof Customer;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}

// components
export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [customer, setCustomer] = useState<Customer>({
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

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  //fetch customer
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await fetch(`/api/customers/${id}`);
        const data = await res.json();

        const customerData = data.customer;

        setCustomer({
          ...customerData,
          leadSource: customerData.leadSource || "",
          status: customerData.status || "NEW",
          tags: Array.isArray(customerData.tags)
            ? customerData.tags.join(", ")
            : customerData.tags || "",
        });
      } catch (err: any) {
        toast.error("Failed to load customer");
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchCustomer();
  }, [id]);

  // input change
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

  //customer update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = Cookies.get("token");

    try {
      const payload = {
        ...customer,
        tags: customer.tags
          ? customer.tags.split(",").map((t) => t.trim())
          : [],
      };

      const res = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Update failed");

      toast.success("Customer updated successfully!");
      router.push("/admin/customers");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 shadow rounded-xl mt-6">
      <h1 className="text-2xl font-semibold mb-4">Edit Customer</h1>

      <form onSubmit={handleUpdate} className="space-y-4">
        <InputField
          label="Organization Name"
          name="organization_name"
          value={customer.organization_name}
          onChange={handleChange}
        />

        <InputField
          label="Contact Person Name *"
          name="contact_person_name"
          value={customer.contact_person_name}
          onChange={handleChange}
          required
        />

        <InputField
          label="Contact Person Email"
          name="contact_person_email"
          value={customer.contact_person_email}
          onChange={handleChange}
        />

        <InputField
          label="Contact Person Phone"
          name="contact_person_phone"
          value={customer.contact_person_phone}
          onChange={handleChange}
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
          label="Address"
          name="address"
          value={customer.address}
          onChange={handleChange}
        />

        <SelectField
          label="Lead Source"
          name="leadSource"
          value={customer.leadSource}
          onChange={handleChange}
          options={["WEBSITE", "MANUAL", "REFERRAL"]}
        />

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
          className="w-full bg-[#aec958] hover:bg-[#99b84f] text-white font-semibold py-3 rounded-md"
        >
          {loading ? "Updating..." : "Update Customer"}
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
function InputField({
  label,
  name,
  value,
  onChange,
  required = false,
}: InputFieldProps) {
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

// resuable select
function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}: SelectFieldProps) {
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
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
