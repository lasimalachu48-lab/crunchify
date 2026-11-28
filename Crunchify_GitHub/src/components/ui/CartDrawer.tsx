"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { formatINR } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    totalCount,
  } = useCart();
  const { settings } = useStore();

  const minOrder = settings.min_order_amount || 10;
  const isBelowMin = subtotal < minOrder && items.length > 0;
  const difference = minOrder - subtotal;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-[#35251D]/45 backdrop-blur-xs z-50 transition-opacity"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="fixed top-0 right-0 h-full h-[100dvh] w-full max-w-md bg-cream-50 z-50 shadow-2xl flex flex-col border-l border-cream-200"
          >
            {/* Header */}
            <div className="p-3.5 sm:p-5 border-b border-cream-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-orange-100 flex items-center justify-center text-brand-orange">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h2 className="font-display text-base sm:text-lg font-bold text-stone-900">
                    Your Snack Bag
                  </h2>
                  <p className="text-[11px] sm:text-xs text-stone-500 font-medium">
                    {totalCount} {totalCount === 1 ? "item" : "items"} selected
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="p-1.5 sm:p-2 text-stone-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors text-xs font-semibold flex items-center gap-1"
                    title="Clear bag"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                )}
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 sm:p-2 text-stone-400 hover:text-stone-800 rounded-xl hover:bg-cream-100 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
                  <div className="w-20 h-20 rounded-full bg-cream-200/60 flex items-center justify-center text-stone-400 mb-4 animate-float">
                    <ShoppingBag className="w-10 h-10 text-stone-400" />
                  </div>
                  <h3 className="font-bold text-stone-800 text-lg mb-1">
                    Your Bag is Empty!
                  </h3>
                  <p className="text-xs text-stone-500 max-w-xs mb-6">
                    Don&apos;t let those late-night cravings wait. Explore our crispy chips, chocolates and drinks!
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-6 py-3 rounded-2xl bg-brand-orange text-white font-bold text-xs shadow-md hover:bg-brand-orange-dark transition-all active:scale-95 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Start Munching
                  </button>
                </div>
              ) : (
                items.map((item) => {
                  const isMax = item.quantity >= item.product.stock;

                  return (
                    <div
                      key={item.product.id}
                      className="bg-white rounded-2xl p-3 sm:p-4 border border-cream-200 shadow-sm flex items-center gap-3"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-cream-100 shrink-0">
                        <Image
                          src={item.product.image_url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-xs font-semibold text-brand-orange mt-0.5">
                          {formatINR(item.product.price)} each
                        </p>

                        {/* Stock limit note */}
                        {isMax && (
                          <span className="text-[10px] text-amber-600 font-bold block mt-0.5">
                            Max stock reached ({item.product.stock})
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <div className="flex items-center gap-1 bg-cream-100 border border-cream-200 rounded-xl p-0.5">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                            className="w-6 h-6 flex items-center justify-center rounded-lg bg-white text-stone-700 hover:bg-stone-100 active:scale-95 transition-colors shadow-xs"
                            aria-label="Decrease"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-stone-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                            disabled={isMax}
                            className={`w-6 h-6 flex items-center justify-center rounded-lg transition-colors active:scale-95 shadow-xs ${
                              isMax
                                ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                                : "bg-brand-orange text-white hover:bg-brand-orange-dark"
                            }`}
                            aria-label="Increase"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-black text-stone-900">
                          {formatINR(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Summary & Checkout Button */}
            {items.length > 0 && (
              <div className="p-5 bg-white border-t border-cream-200 space-y-3">
                {/* Pickup Alert reminder */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-2.5 text-[11px] text-amber-800 flex items-center gap-2">
                  <span className="font-bold">📍 Direct Pickup:</span>
                  <span>{settings.pickup_instructions || "Pick up from owner room"}</span>
                </div>

                {/* Subtotal */}
                <div className="flex items-center justify-between text-sm font-semibold text-stone-600">
                  <span>Subtotal</span>
                  <span className="text-stone-900 font-bold">{formatINR(subtotal)}</span>
                </div>

                {isBelowMin && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 font-bold bg-red-50 p-2 rounded-xl border border-red-100">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>
                      Add {formatINR(difference)} more to reach minimum order of {formatINR(minOrder)}.
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-cream-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-stone-400 block font-medium">To Pay via UPI</span>
                    <span className="text-2xl font-black text-brand-dark">
                      {formatINR(subtotal)}
                    </span>
                  </div>

                  <Link
                    href={isBelowMin ? "#" : "/checkout"}
                    onClick={() => {
                      if (!isBelowMin) setIsCartOpen(false);
                    }}
                    className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all ${
                      isBelowMin
                        ? "bg-stone-300 text-stone-500 cursor-not-allowed pointer-events-none"
                        : "bg-brand-orange hover:bg-brand-orange-dark text-white active:scale-95"
                    }`}
                  >
                    <span>Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

