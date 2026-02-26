import Image from "next/image";
import Link from "next/link";
const FeatureProductsSection = () => {
  return (
    <div className="flex flex-col items-center justify-center text-white font-poppins py-5 md:pt-5 gap-5 md:gap-20">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-5 md:gap-10">
        {/* Feature Products Card */}
        <Link href="/feature-products">
          <div className="relative w-72 h-72 border-2 rounded-xl overflow-hidden cursor-pointer group ">
            <Image
              src="/feature-product.jpeg"
              alt="Feature Products"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 288px"
              className="object-cover rounded-xl group-hover:blur-sm transition duration-300"
            />
            {/* <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
              <h1 className="text-2xl font-semibold drop-shadow-lg">
                Feature Products
              </h1>
              <span className="text-sm mt-2 drop-shadow-md">
                (लोकप्रिय बहुउपयोगी समाग्रीको लागि यहाँ थिच्नुहोस)
              </span>
            </div> */}

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 opacity-0 group-hover:opacity-100 transition duration-300">
              <h1 className="text-2xl font-semibold drop-shadow-lg">
                Feature Products
              </h1>
            </div>
            <div className="absolute inset-0 bg-black/30 rounded-xl" />
          </div>
        </Link>

        {/* Get Quotation Card */}
        <Link href="/quotation">
          <div className="relative w-72 h-72 border-2 rounded-xl overflow-hidden cursor-pointer group">
            <Image
              src="/quotation.jpeg"
              alt="Get Quotation"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 288px"
              className="object-cover rounded-xl group-hover:blur-sm transition duration-300"
            />
            {/* <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
              <h1 className="text-2xl font-semibold drop-shadow-lg">
                Get Quotation
              </h1>
              <span className="text-sm mt-2 drop-shadow-md">
                (कोटेशनको लागि यहाँ थिच्नुहोस)
              </span>
            </div> */}

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 opacity-0 group-hover:opacity-100 transition duration-300">
              <h1 className="text-2xl font-semibold drop-shadow-lg">
                Get Quotation
              </h1>
            </div>
            <div className="absolute inset-0 bg-black/30 rounded-xl" />
          </div>
        </Link>

        {/* repair-and-maintenance Card */}
        <Link href="/maintenance">
          <div className="relative w-72 h-72 border-2 rounded-xl overflow-hidden cursor-pointer group">
            <Image
              src="/repair-maintenance.jpeg"
              alt="repair-and-maintenance"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 288px"
              className="object-cover rounded-xl group-hover:blur-sm transition duration-300"
            />
            {/* <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
              <h1 className="text-2xl font-semibold drop-shadow-lg">
                Repair and maintenance
              </h1>
              <span className="text-sm mt-2 drop-shadow-md">
                (प्याकेजहरुको लागि यहाँ थिच्नुहोस)
              </span>
            </div> */}

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 opacity-0 group-hover:opacity-100 transition duration-300">
              <h1 className="text-2xl font-semibold drop-shadow-lg">
                Repair and Maintenance
              </h1>
            </div>
            <div className="absolute inset-0 bg-black/30 rounded-xl" />
          </div>
        </Link>
      </div>
    </div>
  );
};
export default FeatureProductsSection;
