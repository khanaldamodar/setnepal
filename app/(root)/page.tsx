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
  return (
    <>
      <Introduction />
      <FeatureProductsSection />
      {/* <FeaturedPackages /> */}

      <FeaturedPackages />
      <div className=" justify-center flex flex-col items-center text-white font-poppins">
        <Heading title="Our Products" />
        <ProductSlider products={products} />
       
        <CertificateSliderPage />
      </div>

      {/* Happy CLients */}
    </>
  );
}
