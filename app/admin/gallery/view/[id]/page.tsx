"use client";

import { useParams, useRouter } from "next/navigation";
import { useFetch } from "@/services/useFetch";

interface ImageType {
  id: number;
  url: string;
  title: string;
}

interface GalleryType {
  id: number;
  title: string;
  description: string;
  images: ImageType[];
}

export default function ViewGalleryPage() {
  const params = useParams();
  const router = useRouter();
  const galleryId = Number(params?.id);

  const {
    data: galleries,
    loading,
    error,
  } = useFetch<GalleryType[]>("gallery");

  if (loading) return <div className="p-5">Loading...</div>;
  if (error) return <div className="p-5 text-red-500">{error.message}</div>;

  const gallery = galleries?.find((g) => g.id === galleryId);

  if (!gallery)
    return <div className="p-5 text-red-500">Gallery not found!</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              {gallery.title}
            </h1>
            <p className="text-gray-600 mt-1">{gallery.description}</p>
          </div>

          <button
            onClick={() => router.back()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm"
          >
            ← Back
          </button>
        </div>

        {/* Images */}
        <div>
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Gallery Images
          </h2>

          {gallery.images?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {gallery.images.map((img) => (
                <div
                  key={img.id}
                  className="group rounded-lg overflow-hidden border bg-gray-50"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={img.url}
                      alt={img.title || "Gallery image"}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {img.title && (
                    <div className="p-2 text-sm text-gray-700 truncate">
                      {img.title}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No images in this gallery.</p>
          )}
        </div>
      </div>
    </div>
  );
}
