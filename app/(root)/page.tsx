import { Suspense } from "react";
import Heading from "@/components/global/Heading";
import FeatureProductsSection from "@/components/Homepage-components/FeatureProductsSection";
import Introduction, { IntroductionSkeleton } from "@/components/Homepage-components/Introduction";
import FeaturedPackages, { FeaturedPackagesSkeleton } from "@/components/Homepage-components/FeaturedPackages";
import CertificatesSection, { CertificatesSectionSkeleton } from "@/components/Homepage-components/CertificatesSection";
import ProductsSection, { ProductsSectionSkeleton } from "@/components/Homepage-components/ProductsSection";

export default function Home() {
  return (
    <>
      <Suspense fallback={<IntroductionSkeleton />}>
        <Introduction />
      </Suspense>

      <FeatureProductsSection />

      <Suspense fallback={<FeaturedPackagesSkeleton />}>
        <FeaturedPackages />
      </Suspense>

      <div className=" justify-center flex flex-col items-center text-white font-poppins">
        <Heading title="Our Products" />
        <Suspense fallback={<ProductsSectionSkeleton />}>
          <ProductsSection />
        </Suspense>

        <Suspense fallback={<CertificatesSectionSkeleton />}>
          <CertificatesSection />
        </Suspense>
      </div>

      {/* Happy CLients */}
    </>
  );
}

