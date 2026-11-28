"use client";

import React, { useState } from "react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, User, Phone, Check, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export function CustomerAuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, loginCustomer } = useCustomerAuth();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    loginCustomer(cleanEmail, name, phone);
  };

  const handleGoogleSignIn = () => {
    setErrorMsg(
      "Google OAuth sign-in is not configured yet. Please enter your email address below to sign in and view your orders."
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsAuthModalOpen(false)}
          className="fixed inset-0 bg-[#35251D]/50 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white rounded-3xl sm:rounded-4xl border border-cream-200 shadow-2xl z-10 p-5 sm:p-8 overflow-hidden max-h-[90dvh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full hover:bg-cream-100 text-stone-500 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-5 sm:mb-6">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-orange-100 text-brand-orange flex items-center justify-center mx-auto mb-2.5 sm:mb-3 shadow-xs">
              <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Customer Sign In
            </h2>
            <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
              Sign in with your email to view all your past and live snack orders in one place.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl mb-4 text-center">
              {errorMsg}
            </div>
          )}

          {/* 1-Click Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-3 px-4 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2.5 active:scale-95 mb-4 min-h-[44px]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Instant Sign In with Google</span>
          </button>

          <div className="relative flex items-center justify-center my-3 sm:my-4">
            <div className="border-t border-cream-200 w-full" />
            <span className="bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Or with Email Address
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Your Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl bg-cream-50 border border-cream-200 text-base sm:text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Full Name (Optional)
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl bg-cream-50 border border-cream-200 text-base sm:text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl bg-cream-50 border border-cream-200 text-base sm:text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 min-h-[44px]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-brand-orange hover:bg-brand-orange-dark text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 min-h-[44px]"
            >
              <span>Sign In & View My Orders</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[11px] text-stone-400 text-center mt-4">
            We&apos;ll remember your details for 1-click checkout next time!
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

