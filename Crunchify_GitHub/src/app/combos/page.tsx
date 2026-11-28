"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { formatINR } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { QuickViewModal } from "@/components/ui/QuickViewModal";
import {
  Zap,
  Sparkles,
  ShoppingBag,
  Check,
  Flame,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Eye,
} from "lucide-react";

export default function CombosPage() {
  const { addToCart } = useCart();
  const [combos, setCombos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<{ [id: string]: boolean }>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function loadCombos() {
      try {
        setLoading(true);
        const res = await fetch("/api/products?all=true", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const allProducts: Product[] = data.products || [];

          // Match combos by category ID, slug, name, or tags
          const comboItems = allProducts.filter((p) => {
            const isComboCategory =
              p.category_id === "c1000000-0000-0000-0000-000000000006" ||
              p.category?.slug === "combos" ||
              p.category?.name?.toLowerCase().includes("combo");

            const hasComboTag = p.tags?.some((t) => {
              const tag = t.toLowerCase();
              return (
                tag.includes("combo") ||
                tag.includes("offer") ||
                tag.includes("bundle") ||
                tag.includes("deal") ||
                tag.includes("pack") ||
                tag.includes("save")
              );
            });

            const hasComboName =
              p.name.toLowerCase().includes("bundle") ||
              p.name.toLowerCase().includes("combo") ||
              p.name.toLowerCase().includes("kit") ||
              p.name.toLowerCase().includes("pack");

            return (isComboCategory || hasComboTag || hasComboName) && p.is_active;
          });

          setCombos(comboItems);
        }
      } catch (err) {
        console.error("Failed to load combos:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCombos();
  }, []);

  const handleAddCombo = (combo: Product) => {
    const res = addToCart(combo, 1);
    if (res.success) {
      setAddedIds((prev) => ({ ...prev, [combo.id]: true }));
      setTimeout(() => {
        setAddedIds((prev) => ({ ...prev, [combo.id]: false }));
      }, 1500);
    }
  };

  return (
    <div className="py-8 md:py-14">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-brand-orange transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Snacks</span>
          </Link>
        </div>

        {/* Hero Banner for Combos & Offers */}
        <div className="relative rounded-3xl sm:rounded-4xl bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-5 xs:p-6 sm:p-12 border border-stone-800 shadow-elevated mb-8 sm:mb-12 overflow-hidden">
          <div className="absolute -top-12 -right-12 w-80 h-80 bg-brand-orange/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-80 h-80 bg-brand-red/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-[11px] sm:text-xs font-extrabold uppercase tracking-wider mb-3 sm:mb-4">
              <Zap className="w-3.5 h-3.5 fill-amber-300" />
              <span>Special Value Bundles &amp; Combos</span>
            </div>

            <h1 className="text-2xl xs:text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Midnight Survival Combos &amp; Offers
            </h1>

            <p className="text-stone-300 text-xs sm:text-sm mt-2 sm:mt-3 leading-relaxed">
              Carefully curated snack pairings for late-night study sessions, gaming marathons, and hostel movie nights. Save money and get everything in one quick room pickup from <strong>Room 1246</strong>!
            </p>

            <div className="mt-4 sm:mt-6 flex flex-wrap gap-2.5 sm:gap-4 text-xs font-semibold text-stone-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                Guaranteed Savings
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-400">
                <Sparkles className="w-4 h-4" />
                Instant Room 1246 Pickup
              </span>
            </div>
          </div>
        </div>

        {/* Combos Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl sm:rounded-4xl p-5 sm:p-8 border border-cream-200 animate-pulse space-y-4"
              >
                <div className="w-full aspect-[16/9] bg-cream-200/60 rounded-2xl sm:rounded-3xl" />
                <div className="h-6 bg-cream-200/60 rounded-md w-2/3" />
                <div className="h-4 bg-cream-200/40 rounded-md w-full" />
              </div>
            ))}
          </div>
        ) : combos.length === 0 ? (
          <div className="bg-white rounded-3xl sm:rounded-4xl p-8 sm:p-12 text-center border border-cream-200 shadow-card max-w-md mx-auto my-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-orange-50 text-brand-orange flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-stone-900 mb-1">
              No active combos right now
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              New combos are being added. Check out individual snacks in our catalogue!
            </p>
            <Link
              href="/catalogue"
              className="px-6 py-3 rounded-2xl bg-brand-orange text-white font-bold text-xs shadow-md inline-block"
            >
              Browse Snacks
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {combos.map((combo) => {
              const isAdded = addedIds[combo.id];
              const isOutOfStock = combo.stock <= 0;

              return (
                <div
                  key={combo.id}
                  className="bg-white rounded-3xl sm:rounded-4xl p-4 sm:p-8 border border-cream-200 shadow-card hover:shadow-snack hover:border-brand-orange/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Visual */}
                    <div
                      className="relative w-full aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden bg-cream-100 mb-4 sm:mb-6 cursor-pointer"
                      onClick={() => setSelectedProduct(combo)}
                    >
                      <Image
                        src={combo.image_url}
                        alt={combo.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 flex gap-2">
                        <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-brand-orange text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                          <Flame className="w-3 h-3 fill-amber-300 text-amber-300" />
                          Combo Deal
                        </span>
                      </div>

                      <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3">
                        <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-emerald-500 text-white text-[10px] sm:text-[11px] font-bold shadow-sm">
                          {combo.stock} available
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-2 flex-wrap">
                      {combo.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-cream-100 text-stone-700"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <h2
                      className="text-lg xs:text-xl sm:text-2xl font-black text-stone-900 leading-tight group-hover:text-brand-orange transition-colors cursor-pointer"
                      onClick={() => setSelectedProduct(combo)}
                    >
                      {combo.name}
                    </h2>

                    <p className="text-stone-600 text-xs sm:text-sm mt-1.5 sm:mt-2 leading-relaxed">
                      {combo.description}
                    </p>
                  </div>

                  {/* Pricing and Action */}
                  <div className="mt-5 pt-4 sm:mt-6 sm:pt-5 border-t border-cream-100 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[9px] sm:text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                        Offer Price
                      </span>
                      <span className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight">
                        {formatINR(combo.price)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        onClick={() => setSelectedProduct(combo)}
                        className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-cream-100 hover:bg-cream-200 text-stone-700 text-xs font-bold transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                        title="View combo details"
                        aria-label="View combo details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleAddCombo(combo)}
                        disabled={isOutOfStock}
                        className={`px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 sm:gap-2 active:scale-95 min-h-[40px] ${
                          isOutOfStock
                            ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                            : isAdded
                            ? "bg-emerald-600 text-white"
                            : "bg-brand-orange hover:bg-brand-orange-dark text-white shadow-snack"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Added!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            <span>Grab Combo</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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

