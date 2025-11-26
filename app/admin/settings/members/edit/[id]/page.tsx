"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  designation: string;
  desc?: string | null;
  photo?: string | null;
}

export default function EditMemberPage() {
  const router = useRouter();
  const { id } = useParams();

  const [member, setMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "",
    desc: "",
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Fetch all members and filter by ID
  useEffect(() => {
    if (!id) return;

    const fetchMember = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/members");
        const allMembers: TeamMember[] = res.data.members ?? res.data;

        const data = allMembers.find((m) => m.id === Number(id));

        if (!data) {
          setMember(null);
          return;
        }

        setMember(data);
        setForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          designation: data.designation || "",
          desc: data.desc || "",
        });
        setPreviewImage(data.photo || null);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch member data");
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);

    try {
      const formData = new FormData();

      // Only append fields that exist or changed
      Object.entries(form).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value as string);
        }
      });

      // Only append photo if the user selected a new one
      if (imageFile) formData.append("photo", imageFile);

      await axios.put(`/api/members/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Member updated successfully");
      router.push("/admin/settings/members");
    } catch (err: any) {
      console.error("Update failed:", err);
      toast.error("Failed to update member");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <p className="text-center py-10">Loading member details...</p>;

  if (!member)
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 mb-4">Member not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 shadow rounded-xl">
      <h1 className="text-2xl font-semibold mb-4">Edit Member</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          required
        />

        <Input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />

        <Input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone"
        />

        <Input
          name="designation"
          value={form.designation}
          onChange={handleChange}
          placeholder="Designation"
        />

        <Textarea
          name="desc"
          value={form.desc}
          onChange={handleChange}
          placeholder="Description"
        />

        <div>
          <p className="font-medium">Photo</p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setImageFile(file);
              setPreviewImage(URL.createObjectURL(file));
            }}
          />

          {previewImage && (
            <Image
              src={previewImage}
              width={100}
              height={100}
              alt="Member"
              className="rounded mt-2 border"
            />
          )}
        </div>

        <Button type="submit" disabled={saving} className="w-full">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
