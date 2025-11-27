"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface BankType {
  id: number;
  name: string;
  qrUrl?: string;
}

export default function EditBankPage() {
  const router = useRouter();
  const params = useParams();
  const bankId = Number(params?.id);

  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch bank data
  useEffect(() => {
    const fetchBank = async () => {
      try {
        if (!bankId) throw new Error("Invalid bank ID");

        const res = await fetch("/api/banks");
        const json = await res.json();

        // Handle both array or object responses
        const banks: BankType[] = Array.isArray(json) ? json : json.banks;

        const bank = banks.find((b) => b.id === bankId);

        if (!bank) {
          toast.error("Bank not found");
          router.push("/admin/settings/banks");
          return;
        }

        setName(bank.name);
        setQrUrl(bank.qrUrl || null);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load bank data");
      } finally {
        setLoading(false);
      }
    };

    fetchBank();
  }, [bankId, router]);

  const handleUpdateBank = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Enter bank name");
      return;
    }

    const formData = new FormData();
    formData.append("name", trimmed);
    if (file) formData.append("qr", file);

    try {
      setLoading(true);
      const res = await fetch(`/api/banks/${bankId}`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        toast.success("Bank updated successfully!");
        router.push("/admin/settings/banks");
      } else {
        toast.error("Failed to update bank");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen justify-center items-center font-poppins p-6 text-xl">
        Loading bank...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen justify-center font-poppins p-6">
      <main className="flex-1 max-w-2xl">
        <div className="bg-white shadow-md rounded-xl p-8">
          <h3 className="text-2xl font-bold mb-6">Edit Bank</h3>

          <div className="flex flex-col gap-4">
            {/* Bank Name */}
            <label className="text-sm font-medium text-gray-700">
              Bank Name
            </label>
            <input
              type="text"
              placeholder="Enter Bank Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#aec958] transition"
            />

            {/* QR Upload */}
            <label className="text-sm font-medium text-gray-700">
              Upload QR
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            {/* Show selected file */}
            {file && (
              <p className="text-sm text-gray-600">Selected: {file.name}</p>
            )}

            {/* Existing QR Preview */}
            {!file && qrUrl && (
              <p className="text-sm text-gray-600">
                Current QR:{" "}
                <a
                  href={qrUrl}
                  target="_blank"
                  className="underline text-blue-600"
                >
                  View
                </a>
              </p>
            )}

            <button
              type="button"
              onClick={handleUpdateBank}
              className="bg-[#aec958] hover:bg-[#8da051] text-white px-6 py-2.5 rounded-md font-medium text-sm transition"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Bank"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/settings/banks")}
              className="mt-2 text-sm text-[#aec958] font-semibold hover:underline cursor-pointer"
            >
              ← Back to Bank List
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
