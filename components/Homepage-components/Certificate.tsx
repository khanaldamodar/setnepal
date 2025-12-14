"use client";

import React, { useEffect, useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import Heading from "@/components/global/Heading";
import { AutoplayPlugin } from "@/components/global/SliderAutoplay";

interface Certificate {
  id: number;
  title: string;
  image: string;
}

const CertificateSliderPage = () => {
  // ✅ Hooks FIRST
  const [certificates, setCertificates] = useState<Certificate[] | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await fetch("/api/certificates");
        const data = await res.json();
        setCertificates(data.certificates || []);
      } catch {
        setCertificates([]);
      }
    };

    fetchCertificates();
  }, []);

  // ✅ Hook ALWAYS called
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
      slides: { perView: 3, spacing: 24 },
      breakpoints: {
        "(max-width: 1024px)": { slides: { perView: 2, spacing: 16 } },
        "(max-width: 768px)": { slides: { perView: 1, spacing: 12 } },
      },
      slideChanged(slider) {
        setCurrentSlide(slider.track.details.rel);
      },
    },
    certificates && certificates.length > 0 ? [AutoplayPlugin(3000)] : []
  );

  // ✅ RETURN AFTER ALL HOOKS
  if (!certificates || certificates.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full py-6 px-6 md:px-12 flex flex-col items-center gap-12">
      <Heading title="Our Certificates" />

      <button
        onClick={() => instanceRef.current?.prev()}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/90 shadow-lg rounded-full p-2 z-10"
      >
        <ChevronLeft />
      </button>

      <div ref={sliderRef} className="keen-slider w-full max-w-7xl">
        {certificates.map((item) => (
          <div key={item.id} className="keen-slider__slide p-2">
            <motion.div className="bg-white rounded-xl p-6 shadow">
              <Image
                src={item.image}
                alt={item.title}
                width={400}
                height={280}
              />
            </motion.div>
          </div>
        ))}
      </div>

      <button
        onClick={() => instanceRef.current?.next()}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/90 shadow-lg rounded-full p-2 z-10"
      >
        <ChevronRight />
      </button>
    </div>
  );
};

export default CertificateSliderPage;
