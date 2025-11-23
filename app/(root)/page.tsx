import Heading from "@/components/global/Heading";
import ProductSlider from "@/components/global/ProductSlider";
// import { FeaturedPackages } from "@/components/Homepage-components/featured-packages";
import FeatureProductsSection from "@/components/Homepage-components/FeatureProductsSection";
import HappyClientsSlider from "@/components/Homepage-components/HappyClientsSlider";
import Introduction from "@/components/Homepage-components/Introduction";
import { getProducts } from "@/lib/settings";
import { FeaturedPackages } from "./category/page";
import CertificateSliderPage from "@/components/Homepage-components/Certificate";

export default async function Home() {
  const products = await getProducts();
  // const products = [
  //   {
  //     id: 1,
  //     name: "Electric Guitar",
  //     price: 25000,
  //     image: "/logo.jpeg",
  //     description: "Professional electric guitar with premium sound quality",
  //     category: "Instruments",
  //     rating: 4.8,
  //   },
  //   {
  //     id: 2,
  //     name: "Drum Set",
  //     price: 55000,
  //     image: "/logo.jpeg",
  //     description: "Complete drum set with cymbals and hardware",
  //     category: "Instruments",
  //     rating: 4.6,
  //   },
  //   {
  //     id: 3,
  //     name: "Keyboard",
  //     price: 40000,
  //     image: "/logo.jpeg",
  //     description: "88-key weighted keyboard with MIDI support",
  //     category: "Instruments",
  //     rating: 4.7,
  //   },
  //   {
  //     id: 4,
  //     name: "Violin",
  //     price: 35000,
  //     image: "/logo.jpeg",
  //     description: "Handcrafted violin with excellent resonance",
  //     category: "Instruments",
  //     rating: 4.5,
  //   },
  //   {
  //     id: 5,
  //     name: "Acoustic Guitar",
  //     price: 18000,
  //     image: "/logo.jpeg",
  //     description: "Classic acoustic guitar perfect for beginners",
  //     category: "Instruments",
  //     rating: 4.4,
  //   },
  //   {
  //     id: 6,
  //     name: "Bass Guitar",
  //     price: 32000,
  //     image: "/logo.jpeg",
  //     description: "5-string bass guitar with active pickups",
  //     category: "Instruments",
  //     rating: 4.9,
  //   },
  //   {
  //     id: 7,
  //     name: "Microphone",
  //     price: 12000,
  //     image: "/logo.jpeg",
  //     description: "Professional condenser microphone for recording",
  //     category: "Audio",
  //     rating: 4.3,
  //   },
  //   {
  //     id: 8,
  //     name: "Amplifier",
  //     price: 45000,
  //     image: "/logo.jpeg",
  //     description: "100W guitar amplifier with effects",
  //     category: "Audio",
  //     rating: 4.7,
  //   },
  // ]

  const certificates = [
    {
      id: 1,
      clientName: "ABC Construction Pvt. Ltd.",
      image: "/logo.jpeg",
      description: "Recognized for excellent IT infrastructure support.",
    },
    {
      id: 2,
      clientName: "Global Tech Nepal",
      image: "/logo.jpeg",
      description: "Outstanding website design and performance delivery.",
    },
    {
      id: 3,
      clientName: "Himalayan Traders",
      image: "/logo.jpeg",
      description: "Appreciation for developing their online platform.",
    },
    {
      id: 4,
      clientName: "Zenith Solutions",
      image: "/logo.jpeg",
      description: "Awarded for digital marketing excellence.",
    },
  ];
  return (
    <>
      <Introduction />
      <FeatureProductsSection />
      {/* <FeaturedPackages /> */}

      <FeaturedPackages />
      <div className=" justify-center flex flex-col items-center text-white font-poppins">
        <Heading title="Our Products" />
        <ProductSlider products={products} />
        {/* <HappyClientsSlider certificates={certificates} /> */}
        <CertificateSliderPage />
      </div>

      {/* Happy CLients */}
    </>
  );
}
