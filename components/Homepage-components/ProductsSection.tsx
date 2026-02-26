import { getProducts } from "@/lib/settings";
import ProductSlider from "../global/ProductSlider";

export default async function ProductsSection() {
    const products = await getProducts();
    return <ProductSlider products={products} />;
}

export function ProductsSectionSkeleton() {
    return (
        <div className="w-full py-5 px-8 md:px-20 animate-pulse">
            <div className="h-64 bg-gray-200 rounded-2xl w-full"></div>
        </div>
    );
}
