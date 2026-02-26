"use client";

import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";

// Images from app/(root)/category/images/
import ScienceImg from "@/app/(root)/category/images/science.png";
import MathsImg from "@/app/(root)/category/images/maths.png";
import ITImg from "@/app/(root)/category/images/IT.png";
import ICTImg from "@/app/(root)/category/images/ICT.png";
import RoboticsImg from "@/app/(root)/category/images/robotics.jpg";
import AIImg from "@/app/(root)/category/images/AI.png";
import Home from "@/app/(root)/category/images/home.png";

interface Category {
    id: number;
    name: string;
}

interface FeaturedPackagesSliderProps {
    categories: Category[];
}

export default function FeaturedPackagesSlider({ categories }: FeaturedPackagesSliderProps) {
    const autoplay = (slider: any) => {
        let timeout: any;
        let mouseOver = false;

        const clear = () => clearTimeout(timeout);

        const start = () => {
            clear();
            if (mouseOver) return;
            timeout = setTimeout(() => slider.next(), 3000);
        };

        slider.on("created", () => {
            slider.container.addEventListener("mouseover", () => {
                mouseOver = true;
                clear();
            });
            slider.container.addEventListener("mouseout", () => {
                mouseOver = false;
                start();
            });
            start();
        });

        slider.on("dragStarted", clear);
        slider.on("animationEnded", start);
        slider.on("updated", start);
    };

    const [sliderRef, instanceRef] = useKeenSlider(
        {
            loop: true,
            mode: "free",
            slides: { perView: 1, spacing: 16 }, // Mobile
            breakpoints: {
                "(min-width: 640px)": { slides: { perView: 2, spacing: 24 } }, // Small tablet
                "(min-width: 1024px)": { slides: { perView: 4, spacing: 40 } }, // Desktop
                "(min-width: 1440px)": { slides: { perView: 5, spacing: 48 } }, // Large desktop
                "(min-width: 1920px)": { slides: { perView: 6, spacing: 56 } }, // Ultra-wide
            },
        },
        [autoplay]
    );

    const getStaticImageById = (id: number): StaticImageData => {
        switch (id) {
            case 1: return ScienceImg;
            case 2: return MathsImg;
            case 3: return ITImg;
            case 4: return ICTImg;
            case 5: return RoboticsImg;
            case 6: return AIImg;
            case 7: return Home;
            default: return ScienceImg;
        }
    };

    return (
        <div className="relative">
            {/* Prev Button */}
            <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-10 hidden md:flex">
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Previous Package"
                    className="rounded-full bg-white/20 hover:bg-white/30 text-white"
                    onClick={() => instanceRef.current?.prev()}
                >
                    <ChevronLeft className="w-5 h-5" />
                </Button>
            </div>

            {/* Next Button */}
            <div className="absolute -right-12 top-1/2 -translate-y-1/2 z-10 hidden md:flex">
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Next Package"
                    className="rounded-full bg-white/20 hover:bg-white/30 text-white"
                    onClick={() => instanceRef.current?.next()}
                >
                    <ChevronRight className="w-5 h-5" />
                </Button>
            </div>

            {/* Slider */}
            <div ref={sliderRef} className="keen-slider">
                {categories.map((c) => (
                    <div key={c.id} className="keen-slider__slide">
                        <Link href={`/category/${c.id}`}>
                            <div className="w-full h-56 sm:h-60 lg:h-64 xl:h-68 2xl:h-72 rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-start items-center p-4">
                                <div className="w-full h-40 sm:h-45 lg:h-44 xl:h-46 2xl:h-60 overflow-hidden rounded-md mb-4">
                                    <Image
                                        src={getStaticImageById(c.id)}
                                        alt={c.name}
                                        width={700}
                                        height={400}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h3 className="font-semibold text-foreground text-sm text-center line-clamp-2">
                                    {c.name}
                                </h3>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
