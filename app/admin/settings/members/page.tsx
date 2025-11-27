"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CRUDTable from "@/components/admin-components/CRUDTable";

interface MemberType {
  id: number;
  name: string;
  email: string;
  phone: string;
  designation: string;
  desc: string;
  photo: string; // URL/path to photo
}

const MembersPage = () => {
  const router = useRouter();
  const [members, setMembers] = useState<MemberType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch members from API
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch("/api/members"); // backend API route
        if (!res.ok) throw new Error("Failed to fetch members");

        const data = await res.json();
        setMembers(data.members ?? []);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  if (loading) return <div className="p-6 text-lg">Loading Members...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 font-poppins">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold">Members</h3>
        <button
          onClick={() => router.push("/admin/settings/members/add")}
          className="bg-[#aec958] rounded-2xl text-white px-4 py-2 hover:bg-green-100 transition cursor-pointer"
        >
          Add Member
        </button>
      </div>

      {/* CRUD Table */}
      <CRUDTable
        endpoint="settings/members" // frontend route for edit/view
        apiEndpoint="members" // backend API route for delete
        columns={["photo", "name", "email", "phone", "designation"]}
        actions={["edit", "delete"]}
        data={members}
        setData={setMembers}
        renderCell={(column, row) => {
          if (column === "photo") {
            return row.photo ? (
              <img
                src={row.photo} // URL/path from DB
                alt={row.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-gray-400">No Photo</span>
            );
          }

          // if (column === "desc") {
          //   if (!row.desc)
          //     return <span className="text-gray-400">No Description</span>;

          //   const shortDesc =
          //     row.desc.length > 50 ? row.desc.slice(0, 50) + "..." : row.desc;

          //   return <span className="text-gray-700">{shortDesc}</span>;
          // }

          return row[column as keyof MemberType];
        }}
      />
    </div>
  );
};

export default MembersPage;
