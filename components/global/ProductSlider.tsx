"use client";

import type React from "react";
import { useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCart } from "@/hooks/use-cart";
import { useCartContext } from "@/context/CartContext";

import { AutoplayPlugin } from "./SliderAutoplay";
import { Button } from "../ui/button";

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description?: string;
  category?: string;
  rating?: number;
  stock?: number;
  sku?: string;
}

interface ProductSliderProps {
  products: Product[];
}

const ProductSlider: React.FC<ProductSliderProps> = ({ products }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [addedToCart, setAddedToCart] = useState<number | null>(null);
  // const { addToCart } = useCart();
  const { addToCart } = useCartContext();

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
      slides: {
        perView: 4,
        spacing: 20,
      },
      breakpoints: {
        "(max-width: 1024px)": {
          slides: { perView: 2, spacing: 15 },
        },
        "(max-width: 768px)": {
          slides: { perView: 1, spacing: 10 },
        },
      },
      slideChanged(slider) {
        setCurrentSlide(slider.track.details.rel);
      },
    },
    [AutoplayPlugin(3000)]
  );

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl,
      category: product.category || "Products",
    });

    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 2000);
  };

  return (
    <div className="relative w-full py-5 px-8 md:px-20 font-poppins">
      {/* Left Arrow */}
      <button
        onClick={() => instanceRef.current?.prev()}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm shadow-lg rounded-full p-2 hover:bg-gray-100 z-10 transition-all hover:scale-110"
      >
        <ChevronLeft className="w-5 h-5 text-gray-700" />
      </button>

      {/* Slider */}
      <div ref={sliderRef} className="keen-slider">
        {products.slice(0, 10).map((product) => (
          <div
            key={product.id}
            className="keen-slider__slide min-w-0 bg-white rounded-2xl shadow-md overflow-hidden flex flex-col justify-between"
          >
            <Link href={`/products/${product.id}`}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex flex-col h-full cursor-pointer"
              >
                <div className="relative group overflow-hidden">
                  <Image
                    src={product.imageUrl || "/placeholder.svg"}
                    alt={product.name}
                    width={400}
                    height={300}
                    className="object-cover w-full h-64 transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="p-4 flex flex-col grow">
                  <h3 className="font-semibold text-lg mb-1 text-gray-800 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {product.description ||
                      "High-quality product built for performance and durability."}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex  items-center  justify-center gap-8">
                      {/* Original Price (strikethrough) */}
                      {/* <span className="text-gray-400 line-through text-sm">
                        Rs. {product.price.toLocaleString()}
                      </span> */}

                      {/* Discounted Price */}
                      <span className="text-lg font-semibold text-[#d86d38]">
                        Rs. {product.price.toLocaleString()}
                        {/* 10% off example */}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>

            <div className="px-4 pb-4">
              <button
                onClick={(e) => handleAddToCart(e, product)}
                className={`w-full py-2 rounded-md flex items-center justify-center gap-2 transition-all duration-300 ${
                  addedToCart === product.id
                    ? "bg-green-600 text-white"
                    : "bg-secondary text-white hover:bg-primary"
                }`}
              >
                <ShoppingCart size={18} />
                {addedToCart === product.id ? "Added!" : "Add to Cart"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => instanceRef.current?.next()}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm shadow-lg rounded-full p-2 hover:bg-gray-100 z-10 transition-all hover:scale-110"
      >
        <ChevronRight className="w-5 h-5 text-gray-700" />
      </button>

      {/* Dots */}
      <div className="flex justify-center mt-6 space-x-2">
        {products.map((_, idx) => (
          <button
            key={idx}
            onClick={() => instanceRef.current?.moveToIdx(idx)}
            className={`w-3 h-3 rounded-full transition-all ${
              currentSlide === idx
                ? "bg-green-600 scale-110"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
          ></button>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link href="/products">
          <Button
            size="lg"
            className="bg-secondary hover:text-primary hover:bg-blue-900"
          >
            View All Products
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ProductSlider;
