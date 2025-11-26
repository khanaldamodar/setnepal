import { Metadata } from "next";
import Sidebar from "@/components/admin-components/Sidebar";
import Navbar from "@/components/admin-components/Navbar";
import React from "react";
import { ToastContainer } from "react-toastify";

// export const metadata: Metadata = {
//   title: "Set Nepal | Admin Dashboard",
//   description: "Admin dashboard for managing the application",
//   icons: {
//     icon: "/logo.jpeg",
//   },
// };

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-6 bg-white text-zinc-800">
          {children}
        </main>
      </div>

      {/* Toasts */}
      <ToastContainer />
    </div>
  );
}
