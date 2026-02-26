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

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings(); // fast, cached
  return (
    <CartProvider>
      <Navbar settings={settings} />
      {children}
      <Footer settings={settings} />
    </CartProvider>
  );
}

