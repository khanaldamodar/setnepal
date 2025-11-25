"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ShoppingBag, Heart, Users, Globe } from "lucide-react";
import { FaInstagramSquare } from "react-icons/fa";
import { FaFacebookSquare } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { FaPhoneFlip } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import Man from "./images/man.png";
import woman from "./images/girl.png";

const teamMembers = [
  {
    name: "Amit Shrestha",
    phone: "+977 9801234567",
    email: "amit@setnepal.com",
    designation: "Founder & CEO",
    photo: Man,
    social: {
      instagram: "https://instagram.com/amit",
      facebook: "https://facebook.com/amit",
      linkedin: "https://linkedin.com/in/amit",
      email: "https://gmail.com",
    },
  },
  {
    name: "Sita Rai",
    phone: "+977 9812345678",
    email: "sita@setnepal.com",
    designation: "Product Manager",
    photo: woman,
    social: {
      instagram: "https://instagram.com/sita",
      facebook: "https://facebook.com/sita",
      linkedin: "https://linkedin.com/in/sita",
      email: "https://gmail.com",
    },
  },

  {
    name: "Amit Shrestha",
    phone: "+977 9801234567",
    email: "amit@setnepal.com",
    designation: "Founder & CEO",
    photo: Man,
    social: {
      instagram: "https://instagram.com/amit",
      facebook: "https://facebook.com/amit",
      linkedin: "https://linkedin.com/in/amit",
      email: "https://gmail.com",
    },
  },
  {
    name: "Sita Rai",
    phone: "+977 9812345678",
    email: "sita@setnepal.com",
    designation: "Product Manager",
    photo: woman,
    social: {
      instagram: "https://instagram.com/sita",
      facebook: "https://facebook.com/sita",
      linkedin: "https://linkedin.com/in/sita",
      email: "https://gmail.com",
    },
  },
];

export default function AboutPage() {
  return (
    <section className="min-h-screen py-30 px-5 md:px-10 flex flex-col items-center font-poppins ">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl w-full text-center mb-20"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
          About <span className="text-secondary">Set Nepal</span>
        </h1>
        <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
          We bring you the best instruments and products you love — with
          passion, precision, and purpose. Our goal is to make quality
          accessible, reliable, and affordable to everyone in Nepal.
        </p>
      </motion.div>

      {/* Story Section */}
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center mb-20">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative h-[350px] md:h-[420px] rounded-3xl overflow-hidden shadow-xl"
        >
          <Image
            src="/logo.jpeg" // Replace with your own image
            alt="Our Story"
            fill
            className="object-cover"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Our Journey 🚀
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Founded with a vision to empower local buyers with access to quality
            instruments, Set Nepal started as a small online store in Kathmandu.
            Over the years, we’ve grown into a trusted name that connects
            customers with authentic, affordable, and durable products.
          </p>
          <p className="text-gray-600 text-lg mt-4 leading-relaxed">
            Our mission is to redefine online shopping in Nepal with
            transparency, fast delivery, and reliable customer service.
          </p>
        </motion.div>
      </div>

      <TeamSection />

      {/* Values Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl w-full text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
          What We Stand For
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Our core values guide everything we do — from sourcing products to
          delivering smiles.
        </p>
      </motion.div>

      {/* Values Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl w-full mb-20">
        {[
          {
            icon: <ShoppingBag className="w-10 h-10 text-[#d86d38]" />,
            title: "Quality Products",
            desc: "We handpick every product to ensure durability, authenticity, and top-tier performance.",
          },
          {
            icon: <Heart className="w-10 h-10 text-[#d86d38]" />,
            title: "Customer Love",
            desc: "Every customer matters to us. Your satisfaction fuels our journey.",
          },
          {
            icon: <Users className="w-10 h-10 text-[#d86d38]" />,
            title: "Community First",
            desc: "We believe in uplifting local businesses and supporting Nepal’s digital growth.",
          },
          {
            icon: <Globe className="w-10 h-10 text-[#d86d38]" />,
            title: "Sustainability",
            desc: "We’re committed to responsible sourcing and eco-friendly packaging.",
          },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 25px rgba(216,109,56,0.2)",
            }}
            className="bg-white/80 backdrop-blur-sm shadow-md rounded-2xl p-8 flex flex-col items-center text-center space-y-3"
          >
            {item.icon}
            <h3 className="text-xl font-semibold text-gray-800">
              {item.title}
            </h3>
            <p className="text-gray-600">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center max-w-3xl"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Join Our Journey 💫
        </h2>
        <p className="text-gray-600 mb-8">
          Be part of a growing eCommerce community that values quality,
          innovation, and trust. Discover new arrivals, special offers, and more
          — only at Set Nepal.
        </p>
        <motion.a
          href="/products"
          whileHover={{
            scale: 1.05,
            backgroundColor: "#c15a2f",
            boxShadow: "0 0 20px rgba(216,109,56,0.5)",
          }}
          whileTap={{ scale: 0.95 }}
          className="inline-block bg-secondary text-white font-semibold px-8 py-3 rounded-full transition-all duration-300"
        >
          Explore Our Products
        </motion.a>
      </motion.div>

      {/* Decorative Circles */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-[#d86d38]/10 blur-3xl rounded-full animate-pulse" />
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-orange-300/20 blur-3xl rounded-full animate-pulse" />
    </section>
  );
}

function TeamSection() {
  return (
    <section className="max-w-7xl mx-auto mb-20 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Meet Our Team
        </h2>

        <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
          Our core values guide everything we do — from sourcing products to
          delivering smiles.
        </p>
      </motion.div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
        {teamMembers.map((member, idx) => (
          <motion.div
            key={idx}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 25px rgba(216,109,56,0.2)",
            }}
            className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-6 sm:p-7 flex flex-col items-center text-center space-y-3"
          >
            {/* Photo */}
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden shadow-md">
              <Image
                src={member.photo}
                alt={member.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Name */}
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
              {member.name}
            </h3>

            {/* Designation */}
            <p className="text-gray-500 text-sm">{member.designation}</p>

            {/* Phone */}
            <p className="text-gray-700 text-sm font-medium flex items-center gap-2">
              <FaPhoneFlip className="text-[#d86d38]" />
              {member.phone}
            </p>

            {/* Social Icons */}
            <div className="flex space-x-4 mt-1">
              {member.social.instagram && (
                <a
                  href={member.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#d86d38]/10 rounded-full hover:bg-[#d86d38]/20 transition"
                >
                  <FaInstagramSquare className="w-5 h-5 text-[#d86d38]" />
                </a>
              )}
              {member.social.facebook && (
                <a
                  href={member.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#d86d38]/10 rounded-full hover:bg-[#d86d38]/20 transition"
                >
                  <FaFacebookSquare className="w-5 h-5 text-[#d86d38]" />
                </a>
              )}
              {member.social.linkedin && (
                <a
                  href={member.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#d86d38]/10 rounded-full hover:bg-[#d86d38]/20 transition"
                >
                  <FaLinkedin className="w-5 h-5 text-[#d86d38]" />
                </a>
              )}
              {member.social.email && (
                <a
                  href={member.social.email}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#d86d38]/10 rounded-full hover:bg-[#d86d38]/20 transition"
                >
                  <MdEmail className="w-5 h-5 text-[#d86d38]" />
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
