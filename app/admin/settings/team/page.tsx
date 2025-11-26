"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CRUDTable from "@/components/admin-components/CRUDTable";

const BrandsPage = () => {
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col font-poppins">
      {/* header */}
      <div className="w-full flex items-center justify-between ">
        <h3 className="text-2xl font-bold">Our Team</h3>
        <button
          onClick={() => router.push("/admin/settings/team/add")}
          className="bg-[#aec958] rounded-2xl text-white px-4 py-2 hover:bg-green-100 transition"
        >
          Add Member
        </button>
      </div>
    </div>
  );
};

export default BrandsPage;
