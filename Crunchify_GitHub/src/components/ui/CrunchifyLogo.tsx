"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playChime } from "@/lib/audio";

interface CrunchifyLogoProps {
  size?: "sm" | "md" | "lg";
  withTagline?: boolean;
  className?: string;
}

export function CrunchifyLogo({
  size = "md",
  withTagline = true,
  className = "",
}: CrunchifyLogoProps) {
  const [bitten, setBitten] = useState(false);
  const [crumbs, setCrumbs] = useState<{ id: number; x: number; y: number; r: number; rotate: number; color: string }[]>([]);

  const handleCrunch = () => {
    playChime("pop");
    setBitten(true);

    // Generate burst of crunchy crumbs
    const newCrumbs = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 60,
      y: (Math.random() - 0.5) * 60 - 15,
      r: Math.random() * 3 + 2,
      rotate: (Math.random() - 0.5) * 360,
      color: ["#FFA800", "#FF5C00", "#FFD700", "#FF3B00", "#F97316"][Math.floor(Math.random() * 5)],
    }));
    setCrumbs(newCrumbs);

    // Reset bite after 1.8 seconds with smooth transition
    setTimeout(() => {
      setBitten(false);
      setCrumbs([]);
    }, 1800);
  };

  const dimensions = {
    sm: { box: "w-7 h-7 sm:w-9 sm:h-9", text: "text-sm sm:text-lg", sub: "text-[9px]" },
    md: { box: "w-8 h-8 sm:w-11 sm:h-11", text: "text-base sm:text-2xl", sub: "text-[10px] sm:text-[11px]" },
    lg: { box: "w-12 h-12 sm:w-16 sm:h-16", text: "text-2xl sm:text-4xl", sub: "text-xs" },
  }[size];

  return (
    <div
      className={`flex items-center gap-1.5 sm:gap-3 cursor-pointer select-none group ${className}`}
      onClick={handleCrunch}
      title="Click me for a tasty CRUNCH!"
    >
      {/* Animated Chip Container */}
      <div className={`relative ${dimensions.box} shrink-0 flex items-center justify-center`}>
        {/* Glow backdrop on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-brand-orange to-amber-400 blur-md opacity-40 group-hover:opacity-80 transition-opacity" />

        {/* Chip Graphic with Bite Cutout */}
        <motion.div
          animate={bitten ? { scale: [1, 0.85, 1.05, 1], rotate: [0, -8, 4, 0] } : { y: [0, -3, 0] }}
          transition={
            bitten
              ? { duration: 0.4, ease: "easeOut" }
              : { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }
          className="relative w-full h-full rounded-2xl bg-gradient-to-tr from-amber-600 via-brand-orange to-yellow-400 p-1.5 shadow-snack overflow-hidden border border-yellow-200/50 flex items-center justify-center"
        >
          {/* Chip SVG with Realistic Texture & Bite Effect */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-sm transition-transform duration-300"
          >
            <defs>
              <linearGradient id="chipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFC72C" />
                <stop offset="50%" stopColor="#FFA000" />
                <stop offset="100%" stopColor="#E65100" />
              </linearGradient>
              <filter id="crispGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#B91C1C" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* Triangle Tortilla / Crunchy Chip Body with Dynamic Bite Cutout */}
            <path
              d={
                bitten
                  ? "M 50 14 C 65 14, 82 45, 84 76 C 80 84, 60 86, 48 85 C 38 78, 36 72, 33 70 C 30 68, 25 72, 18 78 C 16 48, 35 14, 50 14 Z"
                  : "M 50 12 C 72 12, 88 50, 85 82 C 60 88, 40 88, 15 82 C 12 50, 28 12, 50 12 Z"
              }
              fill="url(#chipGrad)"
              filter="url(#crispGlow)"
              className="transition-all duration-300 ease-out"
            />

            {/* Seasoning flecks (Paprika & Herbs) */}
            <circle cx="45" cy="35" r="2.5" fill="#B91C1C" opacity="0.8" />
            <circle cx="62" cy="48" r="2" fill="#881337" opacity="0.75" />
            <circle cx="36" cy="55" r="2.5" fill="#B91C1C" opacity="0.85" />
            <circle cx="54" cy="62" r="2" fill="#78350F" opacity="0.9" />
            <circle cx="70" cy="68" r="1.5" fill="#B91C1C" opacity="0.8" />
            <circle cx="30" cy="38" r="1.5" fill="#FFFFFF" opacity="0.6" />
            <circle cx="60" cy="30" r="1.5" fill="#FFFFFF" opacity="0.5" />

            {/* Bite teeth indentation highlight when bitten */}
            {bitten && (
              <g className="animate-pulse">
                <path
                  d="M 28 72 Q 33 66 38 73 Q 44 65 48 76"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.9"
                />
              </g>
            )}
          </svg>

          {/* Center Sound Wave / Flash Indicator */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span
              className={`text-[10px] font-black text-white px-1 py-0.5 rounded-full bg-brand-red/90 uppercase tracking-widest shadow-xs transition-opacity duration-200 ${
                bitten ? "opacity-100 scale-110" : "opacity-0"
              }`}
            >
              CRUNCH!
            </span>
          </div>
        </motion.div>

        {/* Flying Crumbs Explosion Animation */}
        <AnimatePresence>
          {crumbs.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              animate={{
                opacity: 0,
                scale: 0.2,
                x: c.x,
                y: c.y,
                rotate: c.rotate,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute pointer-events-none"
              style={{
                width: c.r * 2,
                height: c.r * 2,
                borderRadius: "40%",
                backgroundColor: c.color,
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Typography */}
      <div className="min-w-0">
        <div className="flex items-center gap-1 xs:gap-1.5">
          <span
            className={`font-black tracking-tight text-brand-dark group-hover:text-brand-orange transition-colors truncate ${dimensions.text}`}
          >
            CRUNCHIFY
          </span>
          <span className="hidden xs:inline-block px-1.5 py-0.5 rounded-md bg-orange-100/80 text-brand-orange text-[8px] xs:text-[9px] font-black uppercase tracking-wider shrink-0">
            PICKUP
          </span>
        </div>
        {withTagline && (
          <p className={`font-semibold text-brand-muted hidden sm:block tracking-tight ${dimensions.sub}`}>
            Your Cravings. Just One Click Away.
          </p>
        )}
      </div>
    </div>
  );
}

