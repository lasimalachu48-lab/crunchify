"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { Sparkles, X, Flame } from "lucide-react";

export function PromoBanner() {
  const pathname = usePathname();
  const { settings } = useStore();
  const [dismissed, setDismissed] = useState(false);

  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute || !settings.banner_active || !settings.banner_text || dismissed) {
    return null;
  }

  return (
    <div className="relative bg-gradient-to-r from-brand-orange via-orange-500 to-brand-red text-white text-xs sm:text-sm font-medium py-2 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex-1 flex items-center justify-center gap-2 text-center overflow-hidden">
          <span className="flex items-center gap-1.5 shrink-0 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase">
            <Flame className="w-3.5 h-3.5 fill-amber-300 text-amber-300 animate-pulse" />
            Special
          </span>
          <p className="truncate sm:whitespace-normal font-semibold">
            {settings.banner_text}
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white shrink-0"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

