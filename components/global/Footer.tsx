"use client";
export const dynamic = "force-dynamic";
import React from "react";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface SettingsType {
  companyName?: string;
  aboutShort?: string;
  slogan?: string;
  logo?: string;
  favicon?: string;
  phone1?: string;
  phone2?: string;
  email1?: string;
  email2?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  about?: string;
}

interface FooterProps {
  settings: SettingsType;
}

const Footer: React.FC<FooterProps> = ({ settings }) => {
  return (
    <footer className="bg-secondary text-black pt-5 px-8 mt-16 font-poppins">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Logo & About */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            {settings.logo ? (
              <Image
                src={settings.logo || "/logo.jpeg"}
                width={80}
                height={50}
                alt="Logo"
                className="bg-white"
              />
            ) : (
              <Image
                src={"/transparent.png"}
                width={80}
                height={50}
                alt="Logo"
                className="bg-white"
              />
            )}
            <h2 className="text-2xl font-bold text-white mb-4">
              {settings.companyName || "Set Nepal"}
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-black">
            {settings.about ||
              "Your trusted destination to get all the instruments you need."}
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="hover:text-green-500 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                className="hover:text-green-500 transition-colors"
              >
                Products
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="hover:text-green-500 transition-colors"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-green-500 transition-colors"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Support</h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/faq"
                className="hover:text-green-500 transition-colors"
              >
                FAQs
              </Link>
            </li>
            <li>
              <Link
                href="/privacy-policy"
                className="hover:text-green-500 transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="hover:text-green-500 transition-colors"
              >
                Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Contact Us</h3>
          <ul className="space-y-3 text-black">
            <h4 className="text-3xl font-bold text-white ml-7">
              {settings.companyName || "Set Nepal"}
            </h4>

            {settings.phone1 && (
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-green-500" />
                <span>{settings.phone1}</span>
              </li>
            )}
            {settings.phone2 && (
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-green-500" />
                <span>{settings.phone2}</span>
              </li>
            )}
            {settings.email2 && (
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-green-500" />
                <span>{settings?.email2}</span>
              </li>
            )}
            {settings.address && (
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-green-500" />
                <span>{settings.address}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700 mt-5 text-center text-sm text-black-500">
        <p>
          © {new Date().getFullYear()}{" "}
          <span className="text-[#aec958] font-medium ">
            {`${settings.companyName} ` || "Set Nepal."}
          </span>
          <span className="pr-3">All rights reserved. </span>
          <span className="">
            Developed by{" "}
            <a
              href="https://www.shaktatechnology.com/"
              className="text-[#aec958] font-medium cursor-pointer"
            >
              {" Shakta Technology "}
            </a>
          </span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;