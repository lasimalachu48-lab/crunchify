"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Flame, ArrowRight, PackageSearch, ShieldCheck } from "lucide-react";

export default function TrackSearchPage() {
  const router = useRouter();
  const [reference, setReference] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = reference.trim().toUpperCase();
    if (!clean) {
      setError("Please enter your Order Reference (e.g. CRUNCH-XXXX)");
      return;
    }
    router.push(`/track/${clean}`);
  };

  return (
    <div className="py-10 sm:py-16 md:py-24">
      <div className="max-w-md mx-auto px-3.5 sm:px-4 text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-orange-100 text-brand-orange flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-sm">
          <PackageSearch className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Track Your Munchies
        </h1>
        <p className="text-stone-500 text-xs sm:text-sm mt-1.5 sm:mt-2 mb-6 sm:mb-8">
          Enter the unique order reference code you received after placing your order.
        </p>

        <form
          onSubmit={handleSearch}
          className="bg-white rounded-3xl p-4 sm:p-6 border border-cream-200 shadow-card space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 text-left">
              Order Reference ID
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                required
                value={reference}
                onChange={(e) => {
                  setReference(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. CRUNCH-A92B"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-cream-50 border border-cream-200 font-mono text-base sm:text-sm font-bold text-stone-900 uppercase placeholder:normal-case placeholder:font-sans placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange min-h-[44px]"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs font-bold text-red-600 bg-red-50 p-2 rounded-xl text-left">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-2xl bg-brand-orange hover:bg-brand-orange-dark text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 min-h-[44px]"
          >
            <span>Track Order Status</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 sm:mt-8 text-[11px] sm:text-xs text-stone-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Real-time status updates &amp; instant UPI verification</span>
        </div>
      </div>
    </div>
  );
}

