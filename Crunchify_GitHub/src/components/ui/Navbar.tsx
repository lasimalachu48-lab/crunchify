"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { formatINR } from "@/lib/utils";
import { CrunchifyLogo } from "@/components/ui/CrunchifyLogo";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  MapPin,
  ShieldAlert,
  Menu,
  X,
  Clock,
  User,
  LogOut,
  Package,
  Layers,
  Zap,
  Home,
  ChevronRight,
  Flame,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { totalCount, subtotal, setIsCartOpen } = useCart();
  const { settings } = useStore();
  const { customer, setIsAuthModalOpen, logoutCustomer } = useCustomerAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationInfoOpen, setLocationInfoOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile drawer and location banner on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setLocationInfoOpen(false);
  }, [pathname]);

  // Lock background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return null; // Admin has its own dedicated header & sidebar
  }

  const navLinks = [
    { label: "Home", href: "/", icon: <Home className="w-4 h-4" /> },
    { label: "Snack Catalogue", href: "/catalogue", icon: <Layers className="w-4 h-4" /> },
    { label: "Combos & Offers", href: "/combos", icon: <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> },
    { label: "My Orders", href: "/my-orders", icon: <Package className="w-4 h-4" /> },
    { label: "Track Order", href: "/track", icon: <Clock className="w-4 h-4" /> },
  ];

  const displayName = customer?.name || customer?.email?.split("@")[0] || "";

  return (
    <header className="sticky top-0 z-40 bg-[#FFF9F1]/95 backdrop-blur-md border-b border-brand-border transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* ========================================================= */}
        {/* 1. DEDICATED DESKTOP & TABLET HEADER (md screens and up)   */}
        {/* ========================================================= */}
        <div className="hidden md:flex items-center justify-between h-20 gap-2">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0 min-w-0">
            <CrunchifyLogo size="md" withTagline={true} />
          </Link>

          {/* Desktop Navigation Links (Large screens) */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/90 border border-brand-border rounded-full px-2.5 py-1.5 shadow-xs">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? "bg-brand-orange text-white shadow-xs"
                      : "text-brand-dark hover:text-brand-orange hover:bg-cream-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Action Bar */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Pickup Info Pill (xl+ screens) */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-cream-100 border border-brand-border text-xs font-bold text-brand-dark shrink-0">
              <MapPin className="w-3.5 h-3.5 text-brand-orange shrink-0" />
              <span className="whitespace-nowrap">Room 1246, B Block</span>
            </div>

            {/* Customer Auth Button */}
            {customer ? (
              <div className="flex items-center gap-1 bg-white border border-brand-border rounded-2xl p-1 shadow-xs shrink-0 max-w-[170px]">
                <Link
                  href="/my-orders"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-brand-orange transition-colors min-w-0"
                  title={`Signed in as ${customer.email}. Click to view orders.`}
                >
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs font-bold truncate max-w-[90px] block">
                    {displayName}
                  </span>
                </Link>
                <button
                  onClick={logoutCustomer}
                  className="p-1.5 rounded-xl hover:bg-cream-100 text-brand-muted hover:text-brand-red transition-colors shrink-0"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white hover:bg-cream-100 border border-brand-border text-brand-dark font-bold text-xs shadow-xs transition-colors shrink-0 whitespace-nowrap min-h-[40px]"
                title="Sign in with email to see your orders"
              >
                <User className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                <span>Sign In</span>
              </button>
            )}

            {/* Shopping Bag Button (Orange Themed - NO BLACK!) */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white hover:bg-orange-50/70 border-2 border-brand-orange/30 hover:border-brand-orange shadow-xs active:scale-95 group transition-all shrink-0 whitespace-nowrap min-h-[40px]"
              aria-label="Open Shopping Bag"
            >
              <div className="relative flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4 text-brand-orange group-hover:scale-110 transition-transform" />
                {totalCount > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-orange text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                    {totalCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs font-black tracking-tight whitespace-nowrap">
                <span className="text-brand-dark">Bag</span>
                <span className="text-brand-border">•</span>
                <span className="text-brand-orange">{formatINR(subtotal)}</span>
              </div>
            </button>

            {/* Admin Link (Shield Icon) */}
            <Link
              href="/admin"
              className="flex p-2.5 rounded-2xl bg-cream-100 hover:bg-cream-200 border border-brand-border text-brand-muted hover:text-brand-dark transition-colors shrink-0 min-h-[40px] items-center justify-center"
              title="Admin Portal"
            >
              <ShieldAlert className="w-4 h-4" />
            </Link>

            {/* Tablet Hamburger Menu Toggle (md to lg) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2.5 rounded-2xl bg-white border border-brand-border text-brand-dark shrink-0 min-w-[40px] min-h-[40px] flex items-center justify-center active:scale-95 transition-all cursor-pointer relative z-20"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-brand-orange" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. DEDICATED MOBILE HEADER (< md: 320px – 767px phones)    */}
        {/* Uncluttered, zero overlap, professional food delivery app */}
        {/* ========================================================= */}
        <div className="flex md:hidden items-center justify-between h-14 w-full gap-1">
          {/* Left: Compact CRUNCHIFY Logo */}
          <Link href="/" className="flex items-center shrink min-w-0 pr-1">
            <CrunchifyLogo size="sm" withTagline={false} />
          </Link>

          {/* Right: Exactly 3 touch targets (Location, Bag, Menu) — zero collision! */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* 1. Location Pin Quick Action */}
            <button
              type="button"
              onClick={() => setLocationInfoOpen(!locationInfoOpen)}
              className={`p-2 rounded-xl transition-all flex items-center justify-center min-w-[36px] min-h-[36px] cursor-pointer ${
                locationInfoOpen
                  ? "bg-brand-orange text-white shadow-xs"
                  : "bg-white hover:bg-orange-50 border border-brand-border text-brand-orange shadow-xs"
              }`}
              aria-label="Pickup location information"
              title="Pickup: Room 1246, B Block"
            >
              <MapPin className="w-4 h-4" />
            </button>

            {/* 2. Orange-Themed Shopping Bag Button (White/Cream bg, Orange icon & amount, NO BLACK!) */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-orange-50/70 border border-brand-orange/40 active:scale-95 shadow-xs transition-all min-h-[36px] cursor-pointer"
              aria-label="Open Shopping Bag"
            >
              <div className="relative flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4 text-brand-orange" />
                {totalCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[16px] h-[16px] px-0.5 rounded-full bg-brand-orange text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                    {totalCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-black text-brand-orange tracking-tight whitespace-nowrap">
                {formatINR(subtotal)}
              </span>
            </button>

            {/* 3. Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className={`p-2 rounded-xl transition-all flex items-center justify-center min-w-[36px] min-h-[36px] shadow-xs active:scale-95 cursor-pointer relative z-20 ${
                mobileMenuOpen
                  ? "bg-brand-orange text-white"
                  : "bg-white hover:bg-cream-100 border border-brand-border text-brand-dark"
              }`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. MOBILE LOCATION INFO ACCORDION BANNER                  */}
      {/* ========================================================= */}
      <AnimatePresence>
        {locationInfoOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-brand-border bg-orange-50/95 px-3.5 py-2 flex items-center justify-between text-xs text-brand-dark overflow-hidden"
          >
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-3.5 h-3.5 text-brand-orange shrink-0" />
              <span className="font-bold truncate">{settings.pickup_instructions || "Pickup: Room 1246, B Block"}</span>
              <span className="text-brand-muted text-[11px] hidden xs:inline">• ~2 mins pickup</span>
            </div>
            <button
              type="button"
              onClick={() => setLocationInfoOpen(false)}
              className="text-brand-muted hover:text-brand-dark p-1 rounded-md"
              aria-label="Close location banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 4. MODERN MOBILE NAVIGATION SIDEBAR (Portaled to document.body from Right)*/}
      {/* ========================================================================= */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {mobileMenuOpen && (
              <div className="fixed inset-0 z-[9999] lg:hidden">
                {/* Backdrop in warm dark tone */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="fixed inset-0 bg-[#35251D]/60 backdrop-blur-xs z-[9999]"
                />

                {/* Sidebar Sliding from the Right */}
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 280 }}
                  className="fixed top-0 right-0 h-full h-[100dvh] w-[310px] max-w-[85vw] bg-[#FFF9F1] shadow-2xl flex flex-col border-l border-brand-border z-[10000]"
                >
                  {/* Sidebar Header with Close Button */}
                  <div className="p-4 border-b border-brand-border bg-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-brand-orange border border-orange-200">
                        <Flame className="w-4 h-4 fill-brand-orange text-brand-orange" />
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-brand-dark tracking-tight">CRUNCHIFY</h3>
                        <p className="text-[10px] text-brand-muted font-bold">Quick Munchies Menu</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-brand-dark transition-colors active:scale-95 cursor-pointer"
                      aria-label="Close Navigation Sidebar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Scrollable Sidebar Body */}
                  <div className="p-3.5 xs:p-4 space-y-3.5 overflow-y-auto flex-1">
                    {/* User Profile Card */}
                    {customer ? (
                      <div className="p-3.5 bg-white rounded-2xl border border-brand-border flex items-center justify-between shadow-xs">
                        <Link
                          href="/my-orders"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2.5 min-w-0 flex-1 group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-orange-100 text-brand-orange flex items-center justify-center font-black text-sm shrink-0 border border-orange-200">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-black text-brand-dark truncate group-hover:text-brand-orange transition-colors">
                              {displayName}
                            </div>
                            <div className="text-[10px] text-brand-muted truncate">
                              {customer.email}
                            </div>
                            <span className="inline-block mt-0.5 text-[9px] font-bold text-brand-orange">
                              View Orders &amp; Profile →
                            </span>
                          </div>
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            logoutCustomer();
                            setMobileMenuOpen(false);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-brand-red text-xs font-bold transition-colors shrink-0 ml-1.5 cursor-pointer"
                          title="Sign out"
                        >
                          Sign Out
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setIsAuthModalOpen(true);
                        }}
                        className="w-full py-3 px-4 rounded-2xl bg-brand-orange hover:bg-brand-orange-dark text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all cursor-pointer"
                      >
                        <User className="w-4 h-4" />
                        <span>Customer Sign In / Register</span>
                      </button>
                    )}

                    {/* Primary Navigation Menu List */}
                    <div className="space-y-1 bg-white rounded-2xl p-2 border border-brand-border shadow-xs">
                      {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                              isActive
                                ? "bg-brand-orange text-white shadow-xs"
                                : "text-brand-dark hover:bg-cream-100"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {link.icon}
                              <span>{link.label}</span>
                            </div>
                            <ChevronRight className={`w-4 h-4 ${isActive ? "text-white" : "text-brand-muted"}`} />
                          </Link>
                        );
                      })}

                      {/* Admin Portal link inside sidebar */}
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-brand-muted hover:text-brand-dark hover:bg-cream-100 border-t border-cream-100 mt-1 pt-2 min-h-[44px]"
                      >
                        <div className="flex items-center gap-2.5">
                          <ShieldAlert className="w-4 h-4 text-brand-orange" />
                          <span>Admin Management Portal</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-brand-muted" />
                      </Link>
                    </div>

                    {/* Location & Operating Hours Banner Card */}
                    <div className="bg-cream-100/90 rounded-2xl p-3.5 text-xs text-brand-dark space-y-2 border border-brand-border">
                      <div className="flex items-start gap-2.5 font-medium">
                        <MapPin className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block text-brand-dark">Instant Room Pickup</span>
                          <span className="text-brand-muted text-[11px] leading-relaxed">
                            {settings.pickup_instructions || "Pick up directly from Room 1246, B Block. Ready in ~2 mins!"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 font-medium pt-1 border-t border-brand-border/60">
                        <Clock className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                        <span className="text-[11px] text-brand-muted">
                          {settings.opening_hours || "Open till 2:30 AM Daily"}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </header>
  );
}

