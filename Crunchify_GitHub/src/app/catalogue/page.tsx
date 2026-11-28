"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Product } from "@/types";
import { ProductCard } from "@/components/ui/ProductCard";
import { QuickViewModal } from "@/components/ui/QuickViewModal";
import { CategoryPills } from "@/components/home/CategoryPills";
import { Search, SlidersHorizontal, Flame, Sparkles, AlertCircle } from "lucide-react";

function CatalogueContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "stock">("featured");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Sync category param if URL changes
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Fetch products
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const res = await fetch("/api/products", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory =
          selectedCategory === "all" || p.category_id === selectedCategory;
        const matchesSearch =
          search.trim() === "" ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "stock") return b.stock - a.stock;
        // Default: featured first, then in-stock
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return (b.stock > 0 ? 1 : 0) - (a.stock > 0 ? 1 : 0);
      });
  }, [products, selectedCategory, search, sortBy]);

  return (
    <div className="py-6 sm:py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-brand-orange text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 fill-brand-orange" />
            <span>Full Snacks Menu</span>
          </div>
          <h1 className="text-2xl xs:text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Craving Catalogue
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Pick your favorites, pay directly via UPI, and pick up hot or chilled from Room 1246.
          </p>
        </div>

        {/* Filter and Search Bar Controls */}
        <div className="bg-white rounded-3xl p-3.5 sm:p-5 border border-cream-200/90 shadow-card mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search chips, Maggi, chocolate, drinks..."
                className="w-full pl-10 pr-12 py-2.5 rounded-2xl bg-cream-50 border border-cream-200 text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange transition-all min-h-[42px]"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-700 p-1"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-stone-500" />
                <span className="text-xs font-bold text-stone-500">Sort:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-cream-50 border border-cream-200 rounded-2xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 min-h-[40px]"
              >
                <option value="featured">Featured & Popular</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="stock">Highest Stock</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="pt-2 border-t border-cream-100">
            <CategoryPills
              activeCategory={selectedCategory}
              onSelectCategory={(id) => setSelectedCategory(id)}
            />
          </div>
        </div>

        {/* Product Count Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <p className="text-xs sm:text-sm font-bold text-stone-600">
            Showing <span className="text-brand-orange font-black">{filteredProducts.length}</span> snacks
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-3 sm:p-4 border border-cream-200 animate-pulse space-y-2.5 sm:space-y-3"
              >
                <div className="w-full aspect-[4/3] bg-cream-200/60 rounded-2xl" />
                <div className="h-4 bg-cream-200/60 rounded-md w-3/4" />
                <div className="h-3 bg-cream-200/40 rounded-md w-1/2" />
                <div className="h-8 bg-cream-200/50 rounded-2xl w-full mt-4" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl sm:rounded-4xl p-8 sm:p-12 text-center border border-cream-200 shadow-card max-w-md mx-auto my-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-orange-50 text-brand-orange flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-stone-900 mb-1">
              No snacks matched your search
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Try searching for something else like &quot;chips&quot;, &quot;Maggi&quot;, or &quot;chilled&quot;
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
              }}
              className="px-5 py-2.5 rounded-2xl bg-brand-orange text-white font-bold text-xs shadow-md hover:bg-brand-orange-dark transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-4 lg:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}

        {/* Quick View Modal */}
        <QuickViewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      </div>
    </div>
  );
}

export default function CataloguePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-stone-500">Loading snacks...</div>}>
      <CatalogueContent />
    </Suspense>
  );
}

