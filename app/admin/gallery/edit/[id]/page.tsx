"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { MdTitle, MdOutlineDescription, MdClose } from "react-icons/md";
import { TbPhotoPlus } from "react-icons/tb";
import { useUpdate } from "@/services/useUpdate";
import { toast } from "react-toastify";

interface GalleryType {
  id: number;
  title: string;
  description: string;
  images: (string | { url: string })[];
}

const EditGalleryPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const galleryId = Number(params?.id);

  const [gallery, setGallery] = useState<GalleryType | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ name: string; url: string }[]>([]);
  const [originalImages, setOriginalImages] = useState<{ name: string; url: string }[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);

  const { updateData, loading: updating, error: updateError } = useUpdate<GalleryType>();

  // Fetch gallery
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch("/api/gallery");
        const data: GalleryType[] = await res.json();
        const found = data.find((g) => g.id === galleryId);

        if (!found) return;

        setGallery(found);
        setTitle(found.title);
        setDescription(found.description);

        // Convert backend images to preview objects
        const formatted =
          found.images?.map((img) => {
            const url = typeof img === "string" ? img : img.url;
            const name = url.split("/").pop() || "image";
            return { name, url };
          }) || [];

        setPreviews(formatted);
        setOriginalImages(formatted);
      } catch (err) {
        console.error("Fetch failed:", err);
      }
    };
    fetchGallery();
  }, [galleryId]);

  // Add new images
  const handleImageChange = (files: FileList | null) => {
    if (!files) return;

    const selectedFiles = Array.from(files);

    const newPreviews = selectedFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...selectedFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  // Remove images
  const handleRemoveImage = (index: number) => {
    const removed = previews[index];
    const fileName = removed.name; // ALWAYS compare by filename

    // If original image, mark for backend removal
    if (originalImages.some((img) => img.name === fileName)) {
      setRemovedImages((prev) => [...prev, fileName]);
    }

    // Remove from previews
    setPreviews((prev) => prev.filter((_, i) => i !== index));

    // Remove new files (match by filename)
    setImages((prev) => prev.filter((file) => file.name !== fileName));
  };

  // Submit update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gallery) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("removedImages", JSON.stringify(removedImages));

    images.forEach((img) => formData.append("images", img));

    const result = await updateData(`gallery/${gallery.id}`, formData, "PUT");

    if (result) {
      toast.success("Gallery updated successfully!");
      router.push("/admin/gallery");
    }
  };

  if (!gallery)
    return <div className="p-6 text-lg">Loading gallery...</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <main className="flex-1">
        <div className="bg-white shadow-md rounded-xl p-6 md:p-8">
          <h2 className="text-lg font-semibold text-gray-700 underline mb-4">
            Edit Gallery
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Title"
                icon={<MdTitle className="text-white text-lg" />}
                placeholder="Enter gallery title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <div className="flex flex-col gap-1.5">
                <Label
                  label="Upload Images"
                  icon={<TbPhotoPlus className="text-white text-lg" />}
                />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageChange(e.target.files)}
                  className="border border-gray-300 rounded-md p-2.5 text-sm focus:outline-none"
                />
              </div>
            </div>

            {previews.length > 0 && (
              <div className="flex flex-wrap gap-4 items-center">
                {previews.map((img, index) => (
                  <div key={index} className="relative w-24 h-24">
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-24 h-24 object-cover border border-gray-300 rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      <MdClose size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label
                label="Description"
                icon={<MdOutlineDescription className="text-white text-lg" />}
              />
              <textarea
                placeholder="Write a short description..."
                className="border border-gray-300 rounded-md p-2.5 text-sm h-24"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex justify-center mt-8">
              <button
                type="submit"
                disabled={updating}
                className="bg-[#aec958] hover:bg-[#9bb648] text-white px-6 py-2.5 rounded-md"
              >
                {updating ? "Updating..." : "Save Changes"}
              </button>
            </div>

            {updateError && (
              <p className="text-red-500 text-center mt-2">{String(updateError)}</p>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

interface InputFieldProps {
  label: string;
  type?: string;
  icon: React.ReactNode;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type = "text",
  icon,
  placeholder,
  value,
  onChange,
}) => (
  <div className="flex flex-col gap-1.5">
    <Label label={label} icon={icon} />
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="border border-gray-300 rounded-md p-2.5 text-sm"
    />
  </div>
);

interface LabelProps {
  label: string;
  icon: React.ReactNode;
}

const Label: React.FC<LabelProps> = ({ label, icon }) => (
  <label className="text-gray-700 text-sm font-medium flex items-center gap-2.5">
    <span className="w-8 h-8 flex items-center justify-center rounded-full"
      style={{ backgroundColor: "#aec958" }}>
      {icon}
    </span>
    {label}
  </label>
);

export default EditGalleryPage;
