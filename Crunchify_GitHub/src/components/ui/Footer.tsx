"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { Flame, MapPin, Clock, Phone, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  const pathname = usePathname();
  const { settings } = useStore();

  const isAdminRoute = pathname?.startsWith("/admin");
  if (isAdminRoute) {
    return null; // Admin has its own dedicated control room layout
  }

  return (
    <footer className="bg-white border-t border-cream-200 mt-12 sm:mt-20">
      {/* Pickup Callout Highlight Banner */}
      <div className="bg-gradient-to-r from-cream-100 via-orange-50 to-cream-100 border-b border-cream-200 py-5 sm:py-6 px-3.5 sm:px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-brand-orange text-white flex items-center justify-center shrink-0 shadow-sm">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-bold text-stone-900 text-xs xs:text-sm sm:text-base">
                Physical Room Pickup • Zero Waiting Time
              </h4>
              <p className="text-[11px] sm:text-xs text-stone-600 mt-0.5 max-w-xl">
                {settings.pickup_instructions || "Pick up directly from Room 1246. No delivery hassle. Ready in 2 minutes!"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <Link
              href="/catalogue"
              className="w-full sm:w-auto text-center px-6 py-2.5 rounded-2xl bg-brand-orange hover:bg-brand-orange-dark text-white font-bold text-xs shadow-snack transition-transform active:scale-95 whitespace-nowrap min-h-[40px] flex items-center justify-center"
            >
              Order Now
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Grid: 1-col on mobile, 2-col on tablet, 4-col on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Col 1: Brand Info */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-red to-brand-orange flex items-center justify-center text-white shrink-0">
                <Flame className="w-5 h-5 fill-amber-200 text-amber-200" />
              </div>
              <span className="font-black text-xl tracking-tight text-stone-900">
                CRUNCHIFY
              </span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed max-w-xs">
              Your favourite midnight snacks, spicy chips, cold drinks, and hot Maggi — ready for rapid room pickup with direct UPI payment.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-xl w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>Direct UPI • No Middlemen</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-stone-400">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-stone-600">
              <li>
                <Link href="/" className="hover:text-brand-orange transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/catalogue" className="hover:text-brand-orange transition-colors">
                  All Snacks Catalogue
                </Link>
              </li>
              <li>
                <Link href="/combos" className="hover:text-brand-orange transition-colors">
                  Midnight Gamer Bundles &amp; Offers
                </Link>
              </li>
              <li>
                <Link href="/my-orders" className="hover:text-brand-orange transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-brand-orange transition-colors">
                  Live Order Tracker
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-brand-orange transition-colors">
                  Administrator Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Operating Timings & Pickup Details */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-stone-400">
              Pickup &amp; Hours
            </h4>
            <div className="space-y-2.5 text-xs text-stone-600">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-stone-900">Operating Hours</span>
                  <span>{settings.opening_hours || "5:00 PM – 2:30 AM Daily"}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-stone-900">Pickup Counter</span>
                  <span className="line-clamp-2">{settings.pickup_instructions}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 4: Contact & Payment Info */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-stone-400">
              Direct Contact
            </h4>
            <div className="space-y-2 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-orange shrink-0" />
                <span className="font-semibold">{settings.contact_number}</span>
              </div>
              {/* Payment methods — UPI ID intentionally hidden from public */}
              <div className="p-3 bg-cream-50 rounded-2xl border border-cream-200 mt-2">
                <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                  Accepted Payment
                </span>
                <p className="text-xs text-stone-600 font-semibold">
                  GPay • PhonePe • Paytm • BHIM
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-cream-200 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400 font-medium text-center sm:text-left">
          <p>© {new Date().getFullYear()} CRUNCHIFY. Built for ultimate late night cravings.</p>
          <p className="flex items-center gap-1 justify-center">
            Made with <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500 inline mx-0.5" /> for snack lovers
          </p>
        </div>
      </div>
    </footer>
  );
}
