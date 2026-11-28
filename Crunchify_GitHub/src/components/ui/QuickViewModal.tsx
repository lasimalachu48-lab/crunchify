"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Product } from "@/types";
import { formatINR } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, ShieldCheck, Flame, Check } from "lucide-react";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addToCart, items } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!product) return null;

  const cartItem = items.find((i) => i.product.id === product.id);
  const currentInCart = cartItem ? cartItem.quantity : 0;
  const remainingStock = product.stock - currentInCart;
  const isOutOfStock = product.stock <= 0 || remainingStock <= 0;

  const handleAdd = () => {
    const res = addToCart(product, qty);
    if (!res.success) {
      setErrorMsg(res.message || "Cannot add more items.");
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#35251D]/50 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-cream-50 rounded-3xl sm:rounded-4xl border border-cream-200 shadow-2xl overflow-hidden z-10 flex flex-col md:flex-row max-h-[85dvh] sm:max-h-[90vh]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-stone-600 hover:text-stone-900 shadow-sm transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left: Product Image */}
          <div className="relative w-full md:w-1/2 aspect-[16/10] sm:aspect-square md:aspect-auto bg-cream-100 min-h-[180px] sm:min-h-[260px] shrink-0">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
            />
            {product.is_featured && (
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 inline-flex items-center gap-1 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-brand-orange text-white shadow-sm">
                <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-300 text-amber-300" />
                Featured Craving
              </div>
            )}
          </div>

          {/* Right: Info & Controls */}
          <div className="w-full md:w-1/2 p-4 sm:p-8 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                <span>{product.category?.name || "Snacks"}</span>
                <span>•</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {product.stock} in stock
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-stone-900 leading-tight">
                {product.name}
              </h2>

              <div className="text-xl sm:text-2xl font-black text-brand-orange mt-1 sm:mt-2">
                {formatINR(product.price)}
              </div>

              <p className="text-stone-600 text-xs sm:text-sm mt-2 sm:mt-3 leading-relaxed">
                {product.description}
              </p>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-3 sm:mt-4">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl bg-white border border-cream-200 text-stone-600 text-[10px] sm:text-[11px] font-bold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-cream-200">
              {errorMsg && (
                <div className="text-xs font-bold text-red-600 bg-red-50 p-2 rounded-xl mb-3 text-center border border-red-100">
                  {errorMsg}
                </div>
              )}

              {isOutOfStock ? (
                <div className="text-center py-3 bg-stone-200 rounded-2xl text-stone-500 font-bold text-sm">
                  Currently Out of Stock
                </div>
              ) : (
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="flex items-center bg-white border border-cream-200 rounded-2xl p-1 shadow-inner shrink-0">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-cream-100 transition-colors"
                    >
                      <Minus className="w-4 h-4 text-stone-700" />
                    </button>
                    <span className="w-8 text-center font-bold text-sm text-stone-900">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty((q) => Math.min(remainingStock, q + 1))}
                      disabled={qty >= remainingStock}
                      className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${
                        qty >= remainingStock
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:bg-cream-100"
                      }`}
                    >
                      <Plus className="w-4 h-4 text-stone-700" />
                    </button>
                  </div>

                  <button
                    onClick={handleAdd}
                    className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 min-h-[44px] ${
                      added
                        ? "bg-emerald-600 text-white"
                        : "bg-brand-orange hover:bg-brand-orange-dark text-white shadow-snack"
                    }`}
                  >
                    {added ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added to Bag!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add ({formatINR(product.price * qty)})</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              <p className="text-[11px] text-stone-400 text-center mt-3 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                Physical pickup from owner room • Pay directly via UPI
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

