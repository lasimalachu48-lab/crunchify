import React from "react";
import { getProducts } from "@/lib/db/store";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoryPills } from "@/components/home/CategoryPills";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { ValueBundles } from "@/components/home/ValueBundles";
import { HowItWorks } from "@/components/home/HowItWorks";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Dynamic for real-time stock and product updates

export default async function HomePage() {
  const products = await getProducts({ activeOnly: true });

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Category Quick Bar */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 w-full -mt-4 mb-4">
        <div className="bg-white/80 backdrop-blur-md p-3 sm:p-4 rounded-3xl border border-cream-200/90 shadow-card">
          <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 px-1">
            Browse by Category
          </div>
          <CategoryPills />
        </div>
      </div>

      {/* 3. Featured Bestsellers */}
      <FeaturedSection products={products} />

      {/* 4. Midnight Value Bundles / Combos */}
      <ValueBundles products={products} />

      {/* 5. How It Works (Pickup Model) */}
      <HowItWorks />
    </div>
  );
}

