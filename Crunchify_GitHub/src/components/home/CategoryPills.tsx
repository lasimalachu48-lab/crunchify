"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { Sparkles, Flame, Heart, Coffee, Cookie, Zap, Layers } from "lucide-react";

interface CategoryPillsProps {
  activeCategory?: string;
  onSelectCategory?: (id: string) => void;
}

export function CategoryPills({ activeCategory, onSelectCategory }: CategoryPillsProps) {
  const { categories } = useStore();

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case "chips-crisps":
        return <Sparkles className="w-4 h-4 text-brand-orange" />;
      case "instant-noodles":
        return <Flame className="w-4 h-4 text-red-500" />;
      case "chocolates-sweets":
        return <Heart className="w-4 h-4 text-pink-500" />;
      case "cold-beverages":
        return <Coffee className="w-4 h-4 text-blue-500" />;
      case "biscuits-cookies":
        return <Cookie className="w-4 h-4 text-amber-600" />;
      case "combos":
        return <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />;
      default:
        return <Layers className="w-4 h-4 text-stone-500" />;
    }
  };

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1 touch-pan-x">
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-max pb-1">
        {/* "All Snacks" Pill */}
        {onSelectCategory ? (
          <button
            onClick={() => onSelectCategory("all")}
            className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold transition-all shadow-xs min-h-[38px] ${
              activeCategory === "all" || !activeCategory
                ? "bg-brand-orange text-white shadow-snack scale-102"
                : "bg-white text-stone-700 border border-cream-200 hover:bg-cream-100"
            }`}
          >
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>All Snacks</span>
          </button>
        ) : (
          <Link
            href="/catalogue"
            className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold bg-white text-stone-700 border border-cream-200 hover:bg-cream-100 transition-all shadow-xs min-h-[38px]"
          >
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>All Snacks</span>
          </Link>
        )}

        {/* Dynamic Category Pills */}
        {categories.map((cat) => {
          const isSelected = activeCategory === cat.id;

          if (onSelectCategory) {
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold transition-all shadow-xs min-h-[38px] ${
                  isSelected
                    ? "bg-brand-orange text-white shadow-snack scale-102"
                    : "bg-white text-stone-700 border border-cream-200 hover:bg-cream-100"
                }`}
              >
                {getCategoryIcon(cat.slug)}
                <span>{cat.name}</span>
              </button>
            );
          }

          return (
            <Link
              key={cat.id}
              href={cat.slug === "combos" ? "/combos" : `/catalogue?category=${cat.id}`}
              className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold bg-white text-stone-700 border border-cream-200 hover:bg-cream-100 transition-all shadow-xs min-h-[38px]"
            >
              {getCategoryIcon(cat.slug)}
              <span>{cat.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

