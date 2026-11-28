"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Product } from "@/types";
import { formatINR } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Zap, Sparkles, Check, ShoppingBag, ArrowRight } from "lucide-react";

interface ValueBundlesProps {
  products: Product[];
}

export function ValueBundles({ products }: ValueBundlesProps) {
  const { addToCart, items } = useCart();
  const [feedback, setFeedback] = useState<{ [id: string]: boolean }>({});

  const combos = products.filter(
    (p) =>
      p.category_id === "c1000000-0000-0000-0000-000000000006" ||
      p.tags.some((t) => t.toLowerCase().includes("combo"))
  );

  if (combos.length === 0) return null;

  const handleAddCombo = (combo: Product) => {
    const res = addToCart(combo, 1);
    if (res.success) {
      setFeedback((prev) => ({ ...prev, [combo.id]: true }));
      setTimeout(() => {
        setFeedback((prev) => ({ ...prev, [combo.id]: false }));
      }, 1500);
    }
  };

  return (
    <section className="py-10 sm:py-14 bg-gradient-to-b from-cream-100 to-cream-50 border-y border-cream-200">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-bold mb-2">
            <Zap className="w-3.5 h-3.5 fill-brand-orange" />
            <span>Curated Value Packs</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Midnight Survival Combos
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1.5 sm:mt-2">
            All-in-one snack bundles designed for late-night gaming, coding marathons and exam all-nighters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {combos.map((combo) => {
            const isAdded = feedback[combo.id];
            const isOutOfStock = combo.stock <= 0;

            return (
              <div
                key={combo.id}
                className="bg-white rounded-3xl sm:rounded-4xl p-4 sm:p-7 border border-cream-200 shadow-card hover:shadow-snack hover:border-brand-orange/40 transition-all flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-center"
              >
                {/* Visual */}
                <div className="relative w-full sm:w-44 aspect-[16/9] sm:aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-cream-100 shrink-0">
                  <Image
                    src={combo.image_url}
                    alt={combo.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-brand-orange text-white text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                    Special Bundle
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between w-full min-w-0">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                        {combo.stock} available
                      </span>
                    </div>

                    <h3 className="text-base sm:text-xl font-bold text-stone-900 leading-snug">
                      {combo.name}
                    </h3>

                    <p className="text-xs text-stone-500 mt-1.5 sm:mt-2 leading-relaxed line-clamp-2 sm:line-clamp-none">
                      {combo.description}
                    </p>
                  </div>

                  {/* Pricing & Add */}
                  <div className="mt-4 pt-3 sm:mt-5 sm:pt-4 border-t border-cream-100 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] sm:text-[10px] uppercase font-bold text-stone-400 block">Combo Price</span>
                      <span className="text-xl sm:text-2xl font-black text-brand-dark">
                        {formatINR(combo.price)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddCombo(combo)}
                      disabled={isOutOfStock}
                      className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95 min-h-[40px] ${
                        isOutOfStock
                          ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                          : isAdded
                          ? "bg-emerald-600 text-white"
                          : "bg-brand-orange hover:bg-brand-orange-dark text-white"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Added to Bag!</span>
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
      </div>
    </section>
  );
}

