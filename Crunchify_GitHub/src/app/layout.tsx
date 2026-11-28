import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { StoreProvider } from "@/context/StoreContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { CartDrawer } from "@/components/ui/CartDrawer";
import { PromoBanner } from "@/components/ui/PromoBanner";
import { CustomerAuthModal } from "@/components/ui/CustomerAuthModal";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "CRUNCHIFY • Your Cravings. Just One Click Away.",
  description:
    "Midnight snacks, crispy chips, hot Maggi and cold drinks. Pay directly via UPI and pick up in under 2 minutes!",
  keywords: [
    "snacks",
    "chips",
    "maggi",
    "doritos",
    "upi payment",
    "hostel snacks",
    "midnight cravings",
    "crunchify",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Calistoga&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-cream-50 text-stone-900 selection:bg-brand-orange selection:text-white">
        <StoreProvider>
          <CustomerAuthProvider>
            <CartProvider>
              <PromoBanner />
              <Navbar />
              <main className="flex-1 w-full overflow-x-hidden">{children}</main>
              <CartDrawer />
              <CustomerAuthModal />
              <Footer />
            </CartProvider>
          </CustomerAuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
