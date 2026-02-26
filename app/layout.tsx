import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/global/Navbar";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
});


const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { getSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const icon = settings?.favicon
    ? settings.favicon.startsWith("http")
      ? settings.favicon
      : `/${settings.favicon.replace(/^\//, "")}`
    : "/logo.jpeg";

  return {
    title: settings?.companyName || "Set Nepal",
    description: settings?.aboutShort || "Get All the Instrument you need!",
    icons: {
      icon: icon,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased bg-[#AEC958]`}
      >

        {children}
      </body>
    </html>
  );
}
