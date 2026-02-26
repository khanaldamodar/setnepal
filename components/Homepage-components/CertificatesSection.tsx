import { getCertificates } from "@/lib/settings";
import Heading from "@/components/global/Heading";
import CertificateSlider from "@/components/Homepage-components/CertificateSlider";

export default async function CertificatesSection() {
    const certificates = await getCertificates();

    if (!certificates || certificates.length === 0) return null;

    return (
        <div className="relative w-full py-6 px-6 md:px-12 flex flex-col items-center gap-12">
            <Heading title="Our Certificates" />
            <CertificateSlider certificates={certificates} />
        </div>
    );
}

export function CertificatesSectionSkeleton() {
    return (
        <div className="relative w-full py-6 px-6 md:px-12 flex flex-col items-center gap-12">
            <Heading title="Our Certificates" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-7xl">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 bg-white/10 rounded-xl animate-pulse"></div>
                ))}
            </div>
        </div>
    );
}
