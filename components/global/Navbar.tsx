"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Menu, X } from "lucide-react";
import Image from "next/image";
import { useCartContext } from "@/context/CartContext";
import { FaFacebookF, FaInstagram, FaTwitter, FaTiktok } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";

interface SettingsType {
  companyName?: string;
  logo?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
}

interface NavbarProps {
  settings: SettingsType;
}

export default function Navbar({ settings }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { itemCount } = useCartContext();

  const menuItems = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "About", href: "/about" },
    { name: "Galleries", href: "/galleries" },
    { name: "Contact", href: "/contact" },
  ];

  const handleSearch = () => {
    const input = document.querySelector<HTMLInputElement>(
      'input[placeholder="Search products..."]'
    );
    if (input?.value.trim() !== "") {
      window.location.href = `/products?search=${encodeURIComponent(
        input.value
      )}`;
    }
  };

  return (
    // <header className="w-full font-poppins fixed top-0 left-0 z-50">
    //   <div className="bg-secondary shadow-md">
    //     <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:py-4">

    //       {/* Logo */}
    //       <Link href="/" className="flex items-center gap-2">
    //         <Image
    //           src={settings.logo || "/logo.jpeg"}
    //           alt={settings.companyName || "Set Nepal"}
    //           width={32}
    //           height={32}
    //           className="h-8 w-8 rounded-full"
    //         />
    //         <span className="text-xl font-bold tracking-tight text-white">
    //           {settings.companyName || "Set Nepal"}
    //         </span>
    //       </Link>

    //       {/* Desktop Nav */}
    //       <nav className="hidden md:flex items-center gap-8">
    //         {menuItems.map((item) => (
    //           <Link
    //             key={item.name}
    //             href={item.href}
    //             className="text-white hover:text-primary transition-colors"
    //           >
    //             {item.name}
    //           </Link>
    //         ))}
    //       </nav>

    //       {/* Social Icons */}
    //       <div className="flex items-center gap-4 text-white">
    //         {settings.facebook && (
    //           <a href={settings.facebook} target="_blank" className="hover:text-primary transition">
    //             <FaFacebookF size={14} />
    //           </a>
    //         )}
    //         {settings.instagram && (
    //           <a href={settings.instagram} target="_blank" className="hover:text-primary transition">
    //             <FaInstagram size={14} />
    //           </a>
    //         )}
    //         {settings.twitter && (
    //           <a href={settings.twitter} target="_blank" className="hover:text-primary transition">
    //             <FaTwitter size={14} />
    //           </a>
    //         )}
    //         {settings.tiktok && (
    //           <a href={settings.tiktok} target="_blank" className="hover:text-primary transition">
    //             <FaTiktok size={14} />
    //           </a>
    //         )}
    //       </div>

    //       {/* Cart & Mobile Menu */}
    //       <div className="flex items-center gap-4">
    //         <Link href="/cart" className="relative">
    //           <ShoppingCart className="h-5 w-5 text-white hover:text-primary" />
    //           <span className="absolute -right-2 -top-2 h-4 w-4 text-[10px] flex items-center justify-center rounded-full bg-black text-white">
    //             {itemCount}
    //           </span>
    //         </Link>

    //         <button
    //           className="block md:hidden text-white"
    //           aria-label="Toggle Menu"
    //           onClick={() => setIsMenuOpen(!isMenuOpen)}
    //         >
    //           {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    //         </button>
    //       </div>
    //     </div>
    //   </div>

    //   {/* Mobile Nav */}
    //   {isMenuOpen && (
    //     <div className="border-t bg-primary md:hidden animate-slide-down">
    //       <nav className="flex flex-col space-y-1 p-3">
    //         {menuItems.map((item) => (
    //           <Link
    //             key={item.name}
    //             href={item.href}
    //             onClick={() => setIsMenuOpen(false)}
    //             className="py-2 px-2 rounded hover:bg-gray-50 text-white hover:text-black"
    //           >
    //             {item.name}
    //           </Link>
    //         ))}
    //       </nav>
    //     </div>
    //   )}
    // </header>

    <header className="w-full font-poppins fixed top-0 left-0 z-50">
      <div className="bg-secondary shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={settings.logo || "/logo.jpeg"}
              alt={settings.companyName || "Set Nepal"}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full"
            />
            <span className="text-xl font-bold tracking-tight text-white">
              {settings.companyName || "Set Nepal"}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white hover:text-primary transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Social Icons */}
          <div className="flex items-center gap-4 text-white">
            {settings.facebook && (
              <a
                href={settings.facebook}
                target="_blank"
                className="hover:text-primary transition"
              >
                <FaFacebookF size={14} />
              </a>
            )}
            {settings.instagram && (
              <a
                href={settings.instagram}
                target="_blank"
                className="hover:text-primary transition"
              >
                <FaInstagram size={14} />
              </a>
            )}
            {settings.twitter && (
              <a
                href={settings.twitter}
                target="_blank"
                className="hover:text-primary transition"
              >
                <FaTwitter size={14} />
              </a>
            )}
            {settings.tiktok && (
              <a
                href={settings.tiktok}
                target="_blank"
                className="hover:text-primary transition"
              >
                <FaTiktok size={14} />
              </a>
            )}
          </div>

          {/* Search, Cart & Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative hidden lg:block">
              <input
                type="text"
                placeholder="Search products..."
                className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
              <button
                className="absolute right-0 top-0 mt-1 mr-1 text-white px-2 py-1 rounded bg-primary hover:bg-primary/80"
                onClick={handleSearch}
              >
                <FiSearch />
              </button>
            </div>

            {/* Cart */}
            <Link href="/cart" className="relative">
              <ShoppingCart className="h-5 w-5 text-white hover:text-primary" />
              <span className="absolute -right-2 -top-2 h-4 w-4 text-[10px] flex items-center justify-center rounded-full bg-black text-white">
                {itemCount}
              </span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="block md:hidden text-white"
              aria-label="Toggle Menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="border-t bg-primary md:hidden animate-slide-down">
          <nav className="flex flex-col space-y-1 p-3">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="py-2 px-2 rounded hover:bg-gray-50 text-white hover:text-black"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
