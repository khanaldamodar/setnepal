"use client";

import React, { useEffect, useState } from "react";
import {
  MdOutlineLocalPostOffice,
  MdOutlinePhone,
  MdShortText,
} from "react-icons/md";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { IoLogoFacebook } from "react-icons/io";
import { IoLocation } from "react-icons/io5";
import { RiInstagramFill, RiLinkedinFill } from "react-icons/ri";
import { FcAbout } from "react-icons/fc";
import {
  FaTwitter,
  FaYoutube,
  FaTiktok,
  FaGithub,
  FaGlobe,
} from "react-icons/fa";
import { useUpdate } from "@/services/useUpdate";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<any>(null);

  // Company info
  const [companyName, setCompanyName] = useState("");
  const [slogan, setSlogan] = useState("");
  const [aboutShort, setAboutShort] = useState("");
  const [about, setAbout] = useState("");

  // Contact info
  const [phone1, setPhone1] = useState("");
  const [phone2, setPhone2] = useState("");
  const [email1, setEmail1] = useState("");
  const [email2, setEmail2] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Social
  const [facebook, setFacebook] = useState("");
  const [twitter, setTwitter] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [youtube, setYoutube] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [github, setGithub] = useState("");
  const [website, setWebsite] = useState("");

  // Logo & Favicon
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  const {
    updateData,
    loading: updating,
    error: updateError,
  } = useUpdate<any>();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error("Failed to fetch settings");
        const data = await res.json();
        setSettings(data);

        setCompanyName(data.companyName || "");
        setSlogan(data.slogan || "");
        setAboutShort(data.aboutShort || "");
        setAbout(data.about || "");
        setPhone1(data.phone1 || "");
        setPhone2(data.phone2 || "");
        setEmail1(data.email1 || "");
        setEmail2(data.email2 || "");
        setAddress(data.address || "");
        setCity(data.city || "");
        setPostalCode(data.postalCode || "");
        setFacebook(data.facebook || "");
        setTwitter(data.twitter || "");
        setInstagram(data.instagram || "");
        setLinkedin(data.linkedin || "");
        setYoutube(data.youtube || "");
        setTiktok(data.tiktok || "");
        setGithub(data.github || "");
        setWebsite(data.website || "");
        setLogoPreview(data.logo || null);
        setFaviconPreview(data.favicon || null);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSettings();
  }, []);

  // Handle Save Changes (JSON + files)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    const formData = new FormData();
    formData.append("companyName", companyName);
    formData.append("slogan", slogan);
    formData.append("aboutShort", aboutShort);
    formData.append("about", about);
    formData.append("phone1", phone1);
    formData.append("phone2", phone2);
    formData.append("email1", email1);
    formData.append("email2", email2);
    formData.append("address", address);
    formData.append("city", city);
    formData.append("postalCode", postalCode);
    formData.append("facebook", facebook);
    formData.append("twitter", twitter);
    formData.append("instagram", instagram);
    formData.append("linkedin", linkedin);
    formData.append("youtube", youtube);
    formData.append("tiktok", tiktok);
    formData.append("github", github);
    formData.append("website", website);

    if (logoFile) formData.append("logo", logoFile);
    if (faviconFile) formData.append("favicon", faviconFile);

    const result = await updateData("settings", formData, "PUT");

    if (result) {
      toast.success("Settings updated successfully!");
      if (result.logo) setLogoPreview(result.logo);
      if (result.favicon) setFaviconPreview(result.favicon);
    }
  };

  if (!settings)
    return <div className="p-6 text-black">Loading settings...</div>;

  return (
    <div className="flex min-h-screen justify-center font-poppins">
      <main className="flex-1 max-w-6xl">
        <div className="bg-white shadow-md rounded-xl  md:p-8">
          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            onSubmit={handleSubmit}
          >
            {/* Top Buttons - immediately after Company Settings */}
            <div className="md:col-span-2 flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Company Settings
              </h2>

              <div className="flex gap-3">
                <button
                  type="button"
                  className="bg-[#4998d1] hover:bg-[#62a4d3] text-white px-4 py-2 rounded-md text-sm font-medium transition"
                  onClick={() => router.push("/admin/settings/payment")}
                >
                  Add Payment
                </button>

                <button
                  type="button"
                  className="bg-[#aec958] hover:bg-[#aabe66] text-white px-4 py-2 rounded-md text-sm font-medium transition"
                  onClick={() => router.push("/admin/settings/team")}
                >
                  Add Team
                </button>
              </div>
            </div>

            {/* Company info */}
            <InputField
              label="Company Name"
              icon={<HiOutlineOfficeBuilding className="text-white text-lg" />}
              placeholder="Enter company name"
              value={companyName}
              onChange={setCompanyName}
            />
            <InputField
              label="Slogan"
              icon={<MdShortText className="text-white text-lg" />}
              placeholder="Enter company slogan"
              value={slogan}
              onChange={setSlogan}
            />
            <TextareaField
              label="About Short"
              icon={<FcAbout className="text-white text-lg" />}
              placeholder="Short description..."
              value={aboutShort}
              onChange={setAboutShort}
            />
            <TextareaField
              label="About"
              icon={<FcAbout className="text-white text-lg" />}
              placeholder="Full company description..."
              value={about}
              onChange={setAbout}
            />

            {/* Contact info */}
            <InputField
              label="Phone 1"
              icon={<MdOutlinePhone className="text-white text-lg" />}
              placeholder="Primary phone"
              value={phone1}
              onChange={setPhone1}
            />
            <InputField
              label="Phone 2"
              icon={<MdOutlinePhone className="text-white text-lg" />}
              placeholder="Secondary phone"
              value={phone2}
              onChange={setPhone2}
            />
            <InputField
              label="Email 1"
              icon={<MdOutlineLocalPostOffice className="text-white text-lg" />}
              type="email"
              placeholder="Primary email"
              value={email1}
              onChange={setEmail1}
            />
            <InputField
              label="Email 2"
              icon={<MdOutlineLocalPostOffice className="text-white text-lg" />}
              type="email"
              placeholder="Secondary email"
              value={email2}
              onChange={setEmail2}
            />
            <InputField
              label="Address"
              icon={<IoLocation className="text-white text-lg" />}
              placeholder="Company address"
              value={address}
              onChange={setAddress}
            />
            <InputField
              label="City"
              icon={<IoLocation className="text-white text-lg" />}
              placeholder="City"
              value={city}
              onChange={setCity}
            />
            <InputField
              label="Postal Code"
              icon={<IoLocation className="text-white text-lg" />}
              placeholder="Postal code"
              value={postalCode}
              onChange={setPostalCode}
            />

            {/* Social Media */}
            <h2 className="text-lg font-semibold text-gray-700 underline mb-6 md:col-span-2 mt-6">
              Social Media Links
            </h2>
            <InputField
              label="Facebook"
              icon={<IoLogoFacebook className="text-white text-lg" />}
              placeholder="Facebook URL"
              value={facebook}
              onChange={setFacebook}
            />
            <InputField
              label="Twitter"
              icon={<FaTwitter className="text-white text-lg" />}
              placeholder="Twitter URL"
              value={twitter}
              onChange={setTwitter}
            />
            <InputField
              label="Instagram"
              icon={<RiInstagramFill className="text-white text-lg" />}
              placeholder="Instagram URL"
              value={instagram}
              onChange={setInstagram}
            />
            <InputField
              label="LinkedIn"
              icon={<RiLinkedinFill className="text-white text-lg" />}
              placeholder="LinkedIn URL"
              value={linkedin}
              onChange={setLinkedin}
            />
            <InputField
              label="YouTube"
              icon={<FaYoutube className="text-white text-lg" />}
              placeholder="YouTube URL"
              value={youtube}
              onChange={setYoutube}
            />
            <InputField
              label="TikTok"
              icon={<FaTiktok className="text-white text-lg" />}
              placeholder="TikTok URL"
              value={tiktok}
              onChange={setTiktok}
            />
            <InputField
              label="GitHub"
              icon={<FaGithub className="text-white text-lg" />}
              placeholder="GitHub URL"
              value={github}
              onChange={setGithub}
            />
            <InputField
              label="Website"
              icon={<FaGlobe className="text-white text-lg" />}
              placeholder="Website URL"
              value={website}
              onChange={setWebsite}
            />

            {/* Logo & Favicon */}
            <h2 className="text-lg font-semibold text-gray-700 underline mb-4 md:col-span-2 mt-6">
              Logo & Favicon
            </h2>
            <div className="flex flex-col gap-2">
              <label className="font-medium">Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setLogoFile(file);
                  setLogoPreview(file ? URL.createObjectURL(file) : null);
                }}
              />
              {logoPreview && (
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="h-20 w-20 md:h-24 md:w-24 object-cover rounded-lg shadow-md mt-2 border border-gray-300"
                />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium">Favicon</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFaviconFile(file);
                  setFaviconPreview(file ? URL.createObjectURL(file) : null);
                }}
              />
              {faviconPreview && (
                <img
                  src={faviconPreview}
                  alt="Favicon preview"
                  className="h-12 w-12 md:h-16 md:w-16 object-cover rounded-full shadow-md mt-2 border border-gray-300"
                />
              )}
            </div>

            {/* Save Changes */}
            <div className="md:col-span-2 flex justify-center mt-8">
              <button
                type="submit"
                disabled={updating}
                className="bg-[#aec958] hover:bg-[#9bb648] text-white px-6 py-2.5 rounded-md font-medium text-sm transition"
              >
                {updating ? "Updating..." : "Save Changes"}
              </button>
            </div>

            {updateError && (
              <div className="text-red-500 mt-2 md:col-span-2">
                {updateError}
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}

// Reusable Input & Textarea
const InputField = ({
  label,
  type = "text",
  icon,
  placeholder,
  value,
  onChange,
}: any) => (
  <div className="flex flex-col gap-1.5">
    <Label label={label} icon={icon} />
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-300 rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 transition"
    />
  </div>
);

const TextareaField = ({ label, icon, placeholder, value, onChange }: any) => (
  <div className="flex flex-col gap-1.5">
    <Label label={label} icon={icon} />
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-300 rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 transition resize-y h-20"
    />
  </div>
);

const Label = ({ label, icon }: any) => (
  <label className="text-gray-700 text-sm font-medium flex items-center gap-2.5">
    {icon && (
      <span className="w-8 h-8 flex items-center justify-center rounded-full bg-lime-500">
        {icon}
      </span>
    )}
    {label}
  </label>
);
