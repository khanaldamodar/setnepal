"use client";
import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/admin-components-deepak/DataTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
interface CertificateTypes {
  id: number;
  title: string;
  image: string;
}
const page = () => {
  const [certificates, setcertificates] = useState<CertificateTypes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await fetch("/api/certificates");
        const data = await res.json();

        setcertificates(data.certificates);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  const handleDelete = async (cert: CertificateTypes) => {
    if (!certificates || certificates.length === 0) return;

    if (!confirm(`Are you sure you want to delete "${cert.title}"?`)) return;

    try {
      await axios.delete(`/api/certificates/${cert.id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      toast.success("Certificate deleted successfully");
      setcertificates(certificates.filter((p) => p.id !== cert.id));
    } catch (err) {
      toast.error("Failed to delete Certificate");
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6 font-poppins">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Certificates</h1>
        <Link href="/admin/certificates/add">
          <Button className="flex items-center gap-2 cursor-pointer">
            <Plus size={18} /> Add Certificate
          </Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-center py-10 text-gray-500">
          Loading Certificates...
        </p>
      ) : !certificates || certificates.length === 0 ? (
        <p className="text-center py-10 text-gray-500">
          No Certificates available.
        </p>
      ) : (
        <DataTable
          title="Certificate"
          data={certificates}
          columns={[
            { key: "title", label: "Title" },
            {
              key: "image",
              label: "Image",
              render: (row) => (
                <img
                  src={row.image}
                  alt={row.title}
                  className="w-16 h-16 object-cover rounded-md"
                />
              ),
            },
          ]}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default page;
