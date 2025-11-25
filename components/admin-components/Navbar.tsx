"use client";

import Image from "next/image";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [email, setEmail] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const savedEmail = Cookies.get("email");
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const handleLogout = () => {
    Cookies.remove("email");
    Cookies.remove("token");
    router.push("/login");
  };

  return (
    <nav className="w-full h-16 bg-[#4998d1] flex items-center justify-between px-4 shadow-md font-poppins">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <Image
          src="/logo.jpeg"
          alt="logo"
          width={45}
          height={45}
          className="rounded-full"
        />
        <span className="text-white font-semibold hidden md:block">
          Set <span className="text-blue-200">Nepal</span>
        </span>
      </div>

      {/* Right: Email + Logout */}
      <div className="flex items-center gap-6">
        <span className="text-white hidden sm:block">
          {email || "guest@example.com"}
        </span>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-all"
        >
          Log Out
        </button>
      </div>
    </nav>
  );
}
