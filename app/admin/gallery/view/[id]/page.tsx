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
    <div className="p-6 w-full bg-green-100 rounded shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Gallery Details</h1>

      <p>
        <strong>Title:</strong> {gallery.title}
      </p>
      <p>
        <strong>Description:</strong> {gallery.description}
      </p>

      <div className="mt-4">
        <strong>Images:</strong>
        {gallery.images?.length ? (
          <div className="grid grid-cols-3 gap-4 mt-2">
            {gallery.images.map((img) => (
              <div key={img.id} className="border p-2 rounded bg-white">
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-32 object-cover rounded"
                />
                <p className="mt-1 text-sm text-gray-700">{img.title}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No images</p>
        )}
      </div>

      <button
        className="mt-4 bg-yellow-400 px-4 py-2 rounded cursor-pointer"
        onClick={() => router.back()}
      >
        Go Back
      </button>
    </div>
  );
}
