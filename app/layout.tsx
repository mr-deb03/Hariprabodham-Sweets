import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Bricolage_Grotesque } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import CartDrawer from "@/components/CartDrawer";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });

export const metadata: Metadata = {
  title: "Hariprabodham Sweets — Diwali Special",
  description:
    "Hariprabodham Sweets opens once a year for Diwali — handmade Kaju Katli & Mysore Pak. Free Mumbai delivery, pan-India shipping, and 100% of profit goes to seva.",
  openGraph: {
    type: "website",
    title: "Hariprabodham Sweets — Diwali Special",
    description:
      "The kaju katli Mumbai waits all year for. Order early, pay to confirm, delivered before the festival. 100% of profit to the cause.",
  },
};

export const viewport: Viewport = { themeColor: "#190826" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} ${bricolage.variable}`}>
        <CartProvider>
          <div className="content">{children}</div>
          <CartDrawer />
        </CartProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
