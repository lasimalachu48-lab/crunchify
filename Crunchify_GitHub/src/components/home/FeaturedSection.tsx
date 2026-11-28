"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/types";
import { ProductCard } from "@/components/ui/ProductCard";
import { QuickViewModal } from "@/components/ui/QuickViewModal";
import { Flame, ArrowRight } from "lucide-react";

interface FeaturedSectionProps {
  products: Product[];
}

export function FeaturedSection({ products }: FeaturedSectionProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const featured = products.filter((p) => p.is_featured && p.is_active).slice(0, 8);

  return (
    <section className="py-8 sm:py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-brand-orange text-xs font-bold mb-2">
              <Flame className="w-3.5 h-3.5 fill-brand-orange" />
              <span>Trending Munchies</span>
            </div>
            <h2 className="text-xl xs:text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Top Cravings &amp; Bestsellers
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Handpicked snacks ordered most frequently by hungry night owls.
            </p>
          </div>

          <Link
            href="/catalogue"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:text-brand-orange-dark group transition-colors py-1"
          >
            <span>View Full Snack Menu</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-4 lg:gap-6">
          {featured.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>

        {/* Quick View Modal */}
        <QuickViewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      </div>
    </section>
  );
}

