import { Suspense } from "react";
import Heading from "@/components/global/Heading";
import FeatureProductsSection from "@/components/Homepage-components/FeatureProductsSection";
import Introduction from "@/components/Homepage-components/Introduction";
import { FeaturedPackages } from "./category/page";
import CertificateSliderPage from "@/components/Homepage-components/Certificate";
import ProductsSection, { ProductsSectionSkeleton } from "@/components/Homepage-components/ProductsSection";

export default function Home() {
  return (
    <>
      <Suspense fallback={<div className="h-40 animate-pulse bg-gray-200" />}>
        <Introduction />
      </Suspense>
      <FeatureProductsSection />

      <FeaturedPackages />
      <div className=" justify-center flex flex-col items-center text-white font-poppins">
        <Heading title="Our Products" />
        <Suspense fallback={<ProductsSectionSkeleton />}>
          <ProductsSection />
        </Suspense>

        <CertificateSliderPage />
      </div>

      {/* Happy CLients */}
    </>
  );
}

