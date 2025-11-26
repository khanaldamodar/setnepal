"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaPhoneFlip } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";

interface TeamMember {
  id: number;
  name: string;
  phone: string;
  email?: string;
  desc?: string;
  designation: string;
  photo: string;
}

export default function AboutPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    fetch("/api/members")
      .then((res) => res.json())
      .then((data) => {
        setTeamMembers(data.members ?? []);
      })
      .catch((err) => console.error("Failed to fetch team:", err));
  }, []);

  return (
    <section className="min-h-screen py-30 px-5 md:px-10 flex flex-col items-center font-poppins relative">
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
          <img
            src="/logo.jpeg"
            alt="Our Story"
            className="w-full h-full object-cover rounded-3xl"
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

      {/* Team Section */}
      <section className="max-w-[1200px] mx-auto mb-20 px-4 sm:px-6 lg:px-8">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 justify-items-center">
          {teamMembers.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center">
              Loading team members...
            </p>
          ) : (
            teamMembers.map((member) => (
              <motion.div
                key={member.id}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 25px rgba(216,109,56,0.2)",
                }}
                className="bg-white/90 w-[300px] backdrop-blur-sm shadow-lg rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center space-y-4"
              >
                <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden shadow-md">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="object-cover w-full h-full"
                  />
                </div>

                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                  {member.name}
                </h3>
                <p className="text-gray-500 text-sm">{member.designation}</p>

                <p className="text-gray-700 text-sm font-medium flex items-center gap-2">
                  <FaPhoneFlip className="text-[#d86d38]" />
                  {member.phone}
                </p>

                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="p-2 bg-[#d86d38]/10 rounded-full hover:bg-[#d86d38]/20 transition"
                  >
                    <p className="text-gray-700 text-sm font-medium flex items-center gap-2">
                      <MdEmail className="w-5 h-5 text-[#d86d38]" />
                      {member.email}
                    </p>
                  </a>
                )}

                {/* {member.desc && (
                  <p className="text-gray-500 text-sm">{member.desc}</p>
                )} */}
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Decorative Circles */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-[#d86d38]/10 blur-3xl rounded-full animate-pulse" />
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-orange-300/20 blur-3xl rounded-full animate-pulse" />
    </section>
  );
}
