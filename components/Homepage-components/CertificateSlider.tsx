"use client";

import React, { useEffect, useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

interface Certificate {
  id: number;
  title: string;
  image: string;
}

interface CertificateSliderProps {
  certificates: Certificate[];
}

const AutoplayPlugin = ({ delay = 3000, enabled = true }) => {
  return (slider: any) => {
    let timeout: any;

    const clear = () => clearTimeout(timeout);

    const next = () => {
      clear();
      if (!enabled) return;

      timeout = setTimeout(() => {
        slider.next();
      }, delay);
    };

    slider.on("created", next);
    slider.on("dragStarted", clear);
    slider.on("animationEnded", next);
    slider.on("updated", next);
  };
};

export default function CertificateSlider({
  certificates,
}: CertificateSliderProps) {
  const [perView, setPerView] = useState(3);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth <= 768) setPerView(1);
      else if (window.innerWidth <= 1024) setPerView(2);
      else setPerView(3);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const shouldSlide = certificates.length > perView;
  const showArrows = shouldSlide;

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: shouldSlide,
      drag: shouldSlide,
      slides: {
        perView,
        spacing: 24,
      },
      breakpoints: {
        "(max-width: 1024px)": {
          slides: { perView: 2, spacing: 16 },
        },
        "(max-width: 768px)": {
          slides: { perView: 1, spacing: 12 },
        },
      },
    },
    [
      AutoplayPlugin({
        delay: 3000,
        enabled: shouldSlide,
      }),
    ],
  );

  useEffect(() => {
    instanceRef.current?.update();
  }, [perView, certificates.length]);

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* LEFT ARROW */}
      {showArrows && (
        <button
          onClick={() => instanceRef.current?.prev()}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 z-10 text-gray-700"
        >
          <ChevronLeft />
        </button>
      )}

      {/* slider */}
      <div ref={sliderRef} className="keen-slider w-full max-w-7xl">
        {certificates.map((item) => (
          <div key={item.id} className="keen-slider__slide">
            <motion.div className="h-60 shadow">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.title || "Certificate"}
                width={400}
                height={240}
                className="w-full h-60 object-contain"
              />
            </motion.div>
          </div>
        ))}
      </div>

      {/* right  arraow */}
      {showArrows && (
        <button
          onClick={() => instanceRef.current?.next()}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 z-10 text-gray-700"
        >
          <ChevronRight />
        </button>
      )}
    </div>
  );
}
