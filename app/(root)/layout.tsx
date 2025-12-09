// app/layout.tsx
export const dynamic = "force-dynamic";
import { Poppins } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/global/Navbar";
import Footer from "@/components/global/Footer";
import { CartProvider } from "@/context/CartContext";
import { getSettings } from "@/lib/settings";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings(); // fast, cached
  return (
    <html lang="en">
      <head>
        <title>{settings?.companyName || "Set Nepal"}</title>
        <link
          rel="icon"
          href={
            settings?.favicon
              ? settings.favicon.startsWith("http")
                ? settings.favicon
                : `/${settings.favicon.replace(/^\//, "")}`
              : "/logo.jpeg"
          }
        />
      </head>
      <body className={`${poppins.variable} antialiased bg-[#AEC958]`}>
        <CartProvider>
          <Navbar settings={settings} />
          {children}
        </CartProvider>
        <Footer settings={settings} />
      </body>
    </html>
  );
}
