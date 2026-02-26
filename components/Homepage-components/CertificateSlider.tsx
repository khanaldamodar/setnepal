"use client";

import React, { useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { AutoplayPlugin } from "@/components/global/SliderAutoplay";

interface Certificate {
    id: number;
    title: string;
    image: string;
}

interface CertificateSliderProps {
    certificates: Certificate[];
}

export default function CertificateSlider({ certificates }: CertificateSliderProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

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
        [AutoplayPlugin(3000)]
    );

    return (
        <div className="relative w-full flex flex-col items-center">
            <button
                onClick={() => instanceRef.current?.prev()}
                className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 text-black shadow-lg rounded-full p-2 z-10 hover:scale-110 transition-transform"
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
                                className="w-full h-auto object-contain"
                            />
                        </motion.div>
                    </div>
                ))}
            </div>

            <button
                onClick={() => instanceRef.current?.next()}
                className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 text-black shadow-lg rounded-full p-2 z-10 hover:scale-110 transition-transform"
            >
                <ChevronRight />
            </button>
        </div>
    );
}
