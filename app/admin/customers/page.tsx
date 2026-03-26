"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import CRUDTable from "@/components/admin-components/CRUDTable";

interface CustomerType {
  id: number;
  organization_name?: string;
  contact_person_name: string;
  contact_person_email?: string;
  contact_person_phone?: string;
  email?: string;
  phone?: string;
  address?: string;
  leadSource?: string;
  tags?: string[];
  note?: string;
  status?: string;
  createdAt?: string;
}

const CustomersPage = () => {
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("/api/customers");
        if (!res.ok) throw new Error("Failed to fetch customers");

        const data: CustomerType[] = await res.json();
        setCustomers(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  if (loading) return <div className="p-6 text-lg">Loading customers...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="h-screen flex flex-col font-poppins">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Customers</h1>

        <Link href="/admin/customers/add">
          <Button className="flex items-center gap-2">
            <Plus size={18} /> Add Customer
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="flex-1 p-4 w-full">
        {customers.length > 0 ? (
          <CRUDTable
            endpoint="customers"
            columns={[
              "organization_name",
              "contact_person_name",
              "contact_person_email",
              "contact_person_phone",
              "status",
            ]}
            data={customers}
            setData={setCustomers}
          />
        ) : (
          <div className="text-center text-gray-400 mt-10">
            No customers found.
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomersPage;
