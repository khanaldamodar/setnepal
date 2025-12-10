"use client";

import React, { useState, useEffect } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import Heading from "@/components/global/Heading";
import { AutoplayPlugin } from "@/components/global/SliderAutoplay";

interface Certificate {
  id: number;
  title: string; // from DB
  image: string;
  description?: string;
}

const CertificateSliderPage = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch certificates from API
  // useEffect(() => {
  //   const fetchCertificates = async () => {
  //     try {
  //       const res = await fetch("/api/certificates");
  //       const data = await res.json();
  //       setCertificates(data.certificates || []);
  //     } catch (err) {
  //       console.error("Failed to fetch certificates:", err);
  //     }
  //   };
  //   fetchCertificates();
  // }, []);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await fetch("/api/certificates");
        const data = await res.json();
        setCertificates(data.certificates || []);
      } catch (err) {
        console.error("Failed to fetch certificates:", err);
      }
    };
    fetchCertificates();
  }, []);

  
  if (!certificates || certificates.length === 0) {
    return null;
  }

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
      slides: { perView: 3, spacing: 24 }, // 3 boxes on desktop
      breakpoints: {
        "(max-width: 1024px)": { slides: { perView: 2, spacing: 16 } }, // 2 boxes tablet
        "(max-width: 768px)": { slides: { perView: 1, spacing: 12 } }, // 1 box mobile
      },
      slideChanged(slider) {
        setCurrentSlide(slider.track.details.rel);
      },
    },
    [AutoplayPlugin(3000)] // autoplay every 3s
  );

  if (!certificates || certificates.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500 font-poppins">
        Loading Certificates...
      </div>
    );
  }

  return (
    <div className="relative w-full py-6 px-6 md:px-12 flex flex-col items-center gap-12 ">
      <Heading title="Our Certificates" />

      {/* Left Arrow */}
      <button
        onClick={() => instanceRef.current?.prev()}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/90 shadow-lg rounded-full p-2 hover:bg-gray-100 z-10"
      >
        <ChevronLeft className="w-6 h-6 text-gray-700" />
      </button>

      {/* Slider */}
      <div ref={sliderRef} className="keen-slider w-full max-w-7xl">
        {certificates.map((item) => (
          <div
            key={item.id}
            className="keen-slider__slide flex justify-center items-center p-2"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 250, damping: 15 }}
              className="bg-white w-full h-full rounded-2xl shadow-md overflow-hidden flex flex-col items-center p-6 hover:shadow-xl transition-all duration-300 min-h-[200px]"
            >
              <div className="relative w-full flex justify-center items-center h-48">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={400}
                  height={280}
                  className="rounded-lg object-contain transition-transform duration-300"
                />
              </div>
              {/* <h3 className="mt-4 text-lg font-semibold text-gray-800 text-center">
                {item.title}
              </h3> */}
              {/* Optional description */}
              {/* <p className="text-sm text-gray-500 text-center mt-2">{item.description}</p> */}
            </motion.div>
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => instanceRef.current?.next()}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/90 shadow-lg rounded-full p-2 hover:bg-gray-100 z-10"
      >
        <ChevronRight className="w-6 h-6 text-gray-700" />
      </button>

      {/* Dots */}
      <div className="flex justify-center mt-6 space-x-2">
        {certificates.map((_, idx) => (
          <button
            key={idx}
            onClick={() => instanceRef.current?.moveToIdx(idx)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === idx ? "bg-green-600 scale-125" : "bg-gray-300"
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default CertificateSliderPage;
