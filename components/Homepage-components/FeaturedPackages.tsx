import { getCategories } from "@/lib/settings";
import Heading from "@/components/global/Heading";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import FeaturedPackagesSlider from "@/components/Homepage-components/FeaturedPackagesSlider";

export default async function FeaturedPackages() {
    const categories = await getCategories();

    if (!categories || categories.length === 0) return null;

    return (
        <section className="py-8 font-poppins relative">
            <div className="flex flex-col px-6 md:px-20">
                <div className="mb-12 text-center text-white">
                    <Heading title="Featured Packages" />
                    <p className="mt-4 text-lg text-white">
                        आफ्नो रोजाइको प्याकेज छान्नुहोस्
                    </p>
                </div>

                <FeaturedPackagesSlider categories={categories} />

                <div className="mt-12 text-center">
                    <Link href="/packages">
                        <Button
                            size="lg"
                            className="bg-secondary hover:text-primary hover:bg-blue-900"
                        >
                            View All Packages
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}

export function FeaturedPackagesSkeleton() {
    return (
        <section className="py-8 font-poppins relative">
            <div className="flex flex-col px-6 md:px-20">
                <div className="mb-12 text-center text-white">
                    <Heading title="Featured Packages" />
                    <div className="w-48 h-6 bg-white/20 animate-pulse mx-auto mt-4 rounded"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-64 bg-white/10 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        </section>
    );
}
