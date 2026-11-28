"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Product } from "@/types";
import { formatINR } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Plus, Minus, ShoppingBag, AlertTriangle, Eye, Flame } from "lucide-react";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { items, addToCart, updateQuantity } = useCart();
  const [feedback, setFeedback] = useState<string | null>(null);

  const cartItem = items.find((i) => i.product.id === product.id);
  const currentQuantityInCart = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isMaxInCart = currentQuantityInCart >= product.stock;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const res = addToCart(product, 1);
    if (!res.success && res.message) {
      setFeedback(res.message);
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMaxInCart) {
      setFeedback(`Maximum available stock reached (${product.stock})`);
      setTimeout(() => setFeedback(null), 2500);
      return;
    }
    updateQuantity(product.id, currentQuantityInCart + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(product.id, currentQuantityInCart - 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className={`group relative flex flex-col bg-white rounded-3xl border border-cream-200/90 shadow-card hover:shadow-snack hover:border-brand-orange/40 transition-all duration-300 overflow-hidden ${
        isOutOfStock ? "opacity-75" : ""
      }`}
    >
      {/* Product Image Section */}
      <div
        className="relative w-full aspect-[4/3] bg-gradient-to-b from-cream-100 to-cream-50 overflow-hidden cursor-pointer"
        onClick={() => onQuickView && onQuickView(product)}
      >
        <Image
          src={product.image_url || "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80"}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Floating Badges */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-wrap gap-1 sm:gap-1.5 z-10 max-w-[70%]">
          {product.is_featured && (
            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-brand-orange text-white shadow-sm">
              <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-300 text-amber-300" />
              HOT
            </span>
          )}
          {product.tags?.[0] && !product.is_featured && (
            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-orange-600/90 backdrop-blur-sm text-white truncate max-w-[90px]">
              {product.tags[0]}
            </span>
          )}
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10">
          {isOutOfStock ? (
            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-stone-600/85 backdrop-blur-sm text-stone-100">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold bg-amber-500 text-white shadow-sm animate-pulse">
              <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              Only {product.stock} left
            </span>
          ) : null}
        </div>

        {/* Quick View Eye Button */}
        {onQuickView && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 p-1.5 sm:p-2 rounded-full bg-white/90 backdrop-blur-md text-stone-700 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-orange hover:text-white shadow-sm"
            aria-label="Quick view"
          >
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-stone-500 mb-1">
            <span className="font-medium text-stone-400 capitalize truncate max-w-[60%]">
              {product.category?.name || "Snack"}
            </span>
            {!isOutOfStock && (
              <span className="text-[9px] sm:text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full border border-emerald-100 shrink-0">
                {product.stock} in stock
              </span>
            )}
          </div>

          <h3
            className="font-bold text-stone-900 text-xs sm:text-sm md:text-base leading-snug line-clamp-1 group-hover:text-brand-orange transition-colors cursor-pointer"
            onClick={() => onQuickView && onQuickView(product)}
            title={product.name}
          >
            {product.name}
          </h3>

          <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5 sm:mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Cart Actions */}
        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-cream-100 flex items-center justify-between gap-1.5 sm:gap-2">
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] font-medium text-stone-400 uppercase tracking-wider block">Price</span>
            <span className="text-sm sm:text-lg font-black text-brand-dark tracking-tight">
              {formatINR(product.price)}
            </span>
          </div>

          <div className="shrink-0">
            {isOutOfStock ? (
              <button
                disabled
                className="px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-stone-100 text-stone-400 text-[10px] sm:text-xs font-bold cursor-not-allowed"
              >
                Sold Out
              </button>
            ) : currentQuantityInCart > 0 ? (
              <div className="flex items-center gap-1 sm:gap-1.5 bg-cream-100 border border-cream-300 rounded-xl sm:rounded-2xl p-0.5 sm:p-1 shadow-inner">
                <button
                  onClick={handleDecrement}
                  className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg sm:rounded-xl bg-white text-stone-800 hover:bg-stone-200 transition-colors active:scale-95 shadow-xs"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
                <span className="w-5 sm:w-6 text-center text-[11px] sm:text-xs font-black text-brand-dark">
                  {currentQuantityInCart}
                </span>
                <button
                  onClick={handleIncrement}
                  disabled={isMaxInCart}
                  className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg sm:rounded-xl transition-colors active:scale-95 shadow-xs ${
                    isMaxInCart
                      ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                      : "bg-brand-orange text-white hover:bg-brand-orange-dark"
                  }`}
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-brand-orange hover:bg-brand-orange-dark active:scale-95 text-white text-[11px] sm:text-xs font-bold shadow-sm transition-all min-h-[32px] sm:min-h-[36px]"
              >
                <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>

        {/* Temporary Feedback Toast */}
        {feedback && (
          <div className="mt-2 text-center text-[11px] font-semibold text-brand-red bg-red-50 py-1 px-2 rounded-xl border border-red-100 animate-fadeIn">
            {feedback}
          </div>
        )}
      </div>
    </motion.div>
  );
}

