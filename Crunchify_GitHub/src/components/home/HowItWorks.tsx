"use client";

import React from "react";
import { ShoppingBag, QrCode, DoorOpen, Clock, ShieldCheck, Zap } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export function HowItWorks() {
  const { settings } = useStore();

  const steps = [
    {
      step: "01",
      icon: <ShoppingBag className="w-7 h-7 text-brand-orange" />,
      title: "Choose Your Cravings",
      description: "Pick your favourite chips, noodles, sweet chocolates, and cold beverages straight from the online menu.",
    },
    {
      step: "02",
      icon: <QrCode className="w-7 h-7 text-brand-orange" />,
      title: "Direct UPI Payment",
      description: `Scan our dynamic UPI QR code or tap 'Pay via UPI' on mobile. Enter your 12-digit UTR to verify.`,
    },
    {
      step: "03",
      icon: <DoorOpen className="w-7 h-7 text-brand-orange" />,
      title: "Fast Room Pickup",
      description: `${settings.pickup_instructions || "Walk down to Room 1246"}. Your snack bag is handed over hot & fresh in under 2 minutes!`,
    },
  ];

  return (
    <section className="py-10 sm:py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1 rounded-full bg-cream-200/80 border border-cream-300 text-stone-700 text-xs font-bold mb-2">
            <Zap className="w-3.5 h-3.5 text-brand-orange fill-brand-orange" />
            <span>Fast &amp; Physical Pickup Model</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
            How CRUNCHIFY Works
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1.5 sm:mt-2">
            No delivery apps. No surging fees. Just direct room pickup with instant UPI verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 relative">
          {steps.map((item) => (
            <div
              key={item.step}
              className="relative bg-white rounded-3xl sm:rounded-4xl p-6 sm:p-8 border border-cream-200 shadow-card hover:shadow-snack hover:border-brand-orange/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl bg-cream-100 flex items-center justify-center shadow-inner">
                    {item.icon}
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-cream-300 tracking-tighter">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-stone-900 mb-1.5 sm:mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-5 sm:mt-6 pt-3.5 sm:pt-4 border-t border-cream-100 flex items-center gap-1.5 text-[11px] font-bold text-brand-orange">
                <Clock className="w-3.5 h-3.5" />
                <span>Takes ~2 minutes total</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

