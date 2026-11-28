"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Flame, Sparkles, ArrowRight, Zap, ShieldCheck, Clock, MapPin } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export function HeroSection() {
  const { settings } = useStore();
  const heroImageUrl =
    settings.hero_image_url ||
    "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=1000&q=80";
  const heroBadgeText = settings.hero_badge_text || "Fresh Restock";
  const heroCardTitle = settings.hero_card_title || "Doritos & Chilled Sodas";
  const heroCardSubtitle = settings.hero_card_subtitle || "Ready in the cooler right now";
  const heroDescription =
    settings.hero_description ||
    "Order hot Maggi, crispy Doritos, icy cold drinks, and sweet chocolates. Pay directly via UPI and pick up instantly from Room 1246.";

  return (
    <section className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16 md:pt-16 md:pb-24 w-full">
      {/* Background Glows */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-72 sm:w-[500px] md:w-[600px] h-[300px] bg-gradient-to-tr from-brand-orange/15 to-amber-200/20 blur-3xl rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-orange-100/90 border border-orange-200 text-brand-orange text-[11px] sm:text-xs font-bold shadow-xs max-w-full"
            >
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-brand-orange animate-pulse shrink-0" />
              <span className="truncate">Hostel &amp; Room Midnight Munchies</span>
              <span className="hidden xs:inline-block w-1.5 h-1.5 rounded-full bg-brand-orange shrink-0" />
              <span className="hidden xs:inline-block text-stone-700 whitespace-nowrap">~2 mins pickup</span>
            </motion.div>

            {/* Big Headline with Fluid Typography */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.12] sm:leading-[1.1]"
            >
              Craving Something <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange via-orange-500 to-brand-red">
                Crunchy &amp; Chilled
              </span>{" "}
              Right Now?
            </motion.h1>

            {/* Tagline & Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xs sm:text-base lg:text-lg text-stone-600 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              {settings.tagline || "Your Cravings. Just One Click Away."} {heroDescription}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-3 pt-1 sm:pt-2"
            >
              <Link
                href="/catalogue"
                className="w-full sm:w-auto px-7 py-3.5 sm:py-4 rounded-2xl bg-brand-orange hover:bg-brand-orange-dark text-white font-extrabold text-xs sm:text-sm shadow-snack hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 group min-h-[44px]"
              >
                <span>Browse All Munchies</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/combos"
                className="w-full sm:w-auto px-6 py-3.5 sm:py-4 rounded-2xl bg-white hover:bg-cream-100 border border-cream-300 text-stone-800 font-bold text-xs sm:text-sm shadow-card transition-all active:scale-95 flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Midnight Combos</span>
              </Link>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 text-[11px] sm:text-xs font-semibold text-stone-500"
            >
              <div className="flex items-center gap-1.5 bg-cream-100/70 sm:bg-transparent px-2.5 py-1 sm:p-0 rounded-full">
                <MapPin className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                <span>Room 1246 Pickup</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5 bg-cream-100/70 sm:bg-transparent px-2.5 py-1 sm:p-0 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Zero Delivery Charges</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5 bg-cream-100/70 sm:bg-transparent px-2.5 py-1 sm:p-0 rounded-full">
                <Clock className="w-3.5 h-3.5 text-brand-red shrink-0" />
                <span>Open till 2:30 AM</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Hero Visual Photography Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 relative mt-3 sm:mt-6 lg:mt-0"
          >
            {/* Visual Floating Cards Collage — overflow-hidden clips badges on small screens */}
            <div className="relative mx-auto w-full max-w-[260px] xs:max-w-xs sm:max-w-sm md:max-w-md lg:max-w-none overflow-visible">
              {/* Clip region only on mobile so badges don't widen the page */}
              <div className="overflow-hidden rounded-3xl sm:rounded-4xl sm:overflow-visible">
                {/* Main Visual Image Card */}
                <div className="relative aspect-square rounded-3xl sm:rounded-4xl overflow-hidden border-4 border-white shadow-elevated bg-cream-100">
                  <Image
                    src={heroImageUrl}
                    alt={heroCardTitle}
                    fill
                    priority
                    unoptimized={heroImageUrl.startsWith("data:")}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 sm:bottom-5 left-3 sm:left-5 right-3 sm:right-5 text-white">
                    <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-brand-orange text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                      {heroBadgeText}
                    </span>
                    <h3 className="text-base sm:text-xl font-bold mt-1">{heroCardTitle}</h3>
                    <p className="text-[11px] sm:text-xs text-stone-200">{heroCardSubtitle}</p>
                  </div>
                </div>
              </div>

              {/* Floating Badge 1: Maggi Hot Pot — hidden on 320px, shown xs+ */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="hidden xs:flex absolute -top-3 -left-4 sm:-left-6 lg:-left-8 bg-white/95 backdrop-blur-md border border-cream-200 rounded-2xl sm:rounded-3xl p-2 sm:p-3 shadow-lg items-center gap-2 sm:gap-2.5 z-20 max-w-[160px] sm:max-w-none"
              >
                <div className="relative w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl overflow-hidden bg-cream-100 shrink-0">
                  <Image
                    src="https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=200&q=80"
                    alt="Maggi"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-stone-400 block truncate">Instant Bite</span>
                  <span className="text-[11px] sm:text-xs font-black text-stone-900 block truncate">2-Min Hot Maggi</span>
                  <span className="text-[11px] sm:text-xs font-extrabold text-brand-orange">₹14 Only</span>
                </div>
              </motion.div>

              {/* Floating Badge 2: UPI Fast Verified — hidden on 320px, shown xs+ */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="hidden xs:flex absolute -bottom-3 -right-4 sm:-right-6 lg:-right-6 bg-white/95 backdrop-blur-md border border-cream-200 rounded-2xl sm:rounded-3xl p-2 sm:p-3 shadow-lg items-center gap-2 sm:gap-2.5 z-20 max-w-[160px] sm:max-w-none"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] sm:text-xs font-black text-stone-900 block truncate">Direct UPI QR</span>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-stone-500 truncate block">Scan • Verify • Collect</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
