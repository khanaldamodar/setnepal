"use client";

import React, { useEffect, useState } from "react";
import CRUDTable from "@/components/admin-components/CRUDTable";
import { useRouter } from "next/navigation";

interface MemberType {
  id: number;
  name: string;
  email: string;
  phone: string;
  designation: string;
  desc: string;
  photo: string;
}

const MembersPage = () => {
  const [members, setMembers] = useState<MemberType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch("/api/members");
        if (!res.ok) throw new Error("Failed to fetch members");

        const json = await res.json();
        setMembers(json.members ?? []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  if (loading) return <div className="p-6 text-lg">Loading Members...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 font-poppins">
      <div className="w-full flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold">Members</h3>
        <button
          onClick={() => router.push("/admin/settings/members/add")}
          className="bg-[#aec958] rounded-2xl text-white px-4 py-2 hover:bg-green-100 transition"
        >
          Add Member
        </button>
      </div>

      <CRUDTable
        endpoint="settings/members"
        columns={["name", "email", "phone", "designation"]}
        actions={["edit", "delete"]}
        data={members}
        setData={setMembers}
        renderCell={(column, row) => {
          if (column === "photo") {
            return (
              <img
                src={row.photo}
                alt={row.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            );
          }
          return row[column as keyof MemberType];
        }}
      />
    </div>
  );
};

export default MembersPage;
