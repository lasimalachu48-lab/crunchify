"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { formatINR } from "@/lib/utils";
import {
  MapPin,
  Phone,
  User,
  Mail,
  FileText,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  ArrowLeft,
  Loader2,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { settings } = useStore();
  const { customer, loginCustomer } = useCustomerAuth();

  const [customerName, setCustomerName] = useState(customer?.name || "");
  const [customerEmail, setCustomerEmail] = useState(customer?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(customer?.phone || "");
  const [pickupLocation, setPickupLocation] = useState("");
  const [notes, setNotes] = useState("");

  // Sync if customer logs in or state changes
  useEffect(() => {
    if (customer) {
      if (!customerName && customer.name) setCustomerName(customer.name);
      if (!customerEmail && customer.email) setCustomerEmail(customer.email);
      if (!phoneNumber && customer.phone) setPhoneNumber(customer.phone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const minOrder = settings.min_order_amount || 10;
  const isBelowMin = subtotal < minOrder;

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 px-4 text-center">
        <div className="bg-white rounded-4xl p-8 border border-cream-200 shadow-card">
          <div className="w-16 h-16 rounded-full bg-cream-100 text-stone-400 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">Your Bag is Empty</h2>
          <p className="text-xs text-stone-500 mb-6">
            You don&apos;t have any munchies in your bag yet. Head to the menu to add some!
          </p>
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-orange text-white font-bold text-xs shadow-md hover:bg-brand-orange-dark transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Explore Snacks</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic client validations
    if (!customerName.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }
    const cleanEmail = customerEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address so you can track your order.");
      return;
    }
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!pickupLocation.trim()) {
      setErrorMessage("Please provide your room number or hostel ID (e.g. Room 304, B Block).");
      return;
    }
    if (isBelowMin) {
      setErrorMessage(`Minimum order amount is ₹${minOrder}. Current: ₹${subtotal}.`);
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          customer_email: cleanEmail,
          phone_number: cleanPhone,
          pickup_location: pickupLocation.trim(),
          notes: notes.trim(),
          items: items.map((i) => ({
            product_id: i.product.id,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to create order. Please try again.");
        setSubmitting(false);
        return;
      }

      // Auto save customer session so they can see all their orders under /my-orders
      loginCustomer(cleanEmail, customerName.trim(), cleanPhone);

      // Clear cart and redirect to order tracking & UPI payment page
      clearCart();
      router.push(`/track/${data.order.order_reference}`);
    } catch (err) {
      console.error("Checkout error:", err);
      setErrorMessage("Network error during checkout. Please check your connection.");
      setSubmitting(false);
    }
  };

  return (
    <div className="py-6 sm:py-8 md:py-14">
      <div className="max-w-4xl mx-auto px-3.5 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-4 sm:mb-6">
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-brand-orange transition-colors py-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Browsing Snacks</span>
          </Link>
        </div>

        {/* Page Title */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Checkout &amp; Pickup Details
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Fill in your pickup identification, review your order, and proceed to instant UPI payment.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3.5 sm:p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Column: Form Details */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-4 sm:p-8 border border-cream-200 shadow-card space-y-4 sm:space-y-5">
              <h2 className="text-base sm:text-lg font-bold text-stone-900 border-b border-cream-100 pb-3">
                1. Customer &amp; Pickup Info
              </h2>

              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Your Full Name <span className="text-brand-red">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-cream-50 border border-cream-200 text-base sm:text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange min-h-[44px]"
                  />
                </div>
              </div>

              {/* Customer Email */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Your Email Address <span className="text-brand-red">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. rahul@gmail.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-cream-50 border border-cream-200 text-base sm:text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange min-h-[44px]"
                  />
                </div>
                <span className="text-[11px] text-stone-400 mt-1 block">
                  Enables you to sign in anytime and view all orders under My Orders.
                </span>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  WhatsApp / Phone Number <span className="text-brand-red">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-cream-50 border border-cream-200 text-base sm:text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange min-h-[44px]"
                  />
                </div>
                <span className="text-[11px] text-stone-400 mt-1 block">
                  Used for order pickup alerts &amp; verification.
                </span>
              </div>

              {/* Room Number / Pickup ID */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Your Room Number / B Block <span className="text-brand-red">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-orange" />
                  <input
                    type="text"
                    required
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="e.g. Room 304, B Block (or 'Visiting from Library')"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-cream-50 border border-cream-200 text-base sm:text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange min-h-[44px]"
                  />
                </div>
                <span className="text-[11px] text-stone-400 mt-1 block">
                  Identifies you when you arrive at the owner&apos;s pickup counter in B Block.
                </span>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Optional Notes / Special Requests
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Please keep Coke extra chilled, or will pick up in 10 mins"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-cream-50 border border-cream-200 text-base sm:text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange"
                  />
                </div>
              </div>

              {/* Physical Pickup Reminder Banner */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-orange-50 border border-orange-200 flex items-start gap-2.5 sm:gap-3">
                <MapPin className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                <div className="text-xs text-stone-700">
                  <span className="font-bold block text-stone-900">
                    Important: Self-Pickup Location
                  </span>
                  <span>
                    {settings.pickup_instructions || "Pick up directly from Room 1246, B Block. No delivery riders."}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || isBelowMin}
                className={`w-full py-3.5 sm:py-4 px-6 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 min-h-[46px] ${
                  submitting || isBelowMin
                    ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                    : "bg-brand-orange hover:bg-brand-orange-dark text-white active:scale-95"
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating Order &amp; Generating UPI QR...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to UPI Payment ({formatINR(subtotal)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Order Summary — appears first on mobile */}
          <div className="lg:col-span-5 space-y-4 order-1 lg:order-2">
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-cream-200 shadow-card">
              <h2 className="text-base font-bold text-stone-900 border-b border-cream-100 pb-3 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs font-semibold text-stone-500">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              </h2>

              {/* Items List */}
              <div className="divide-y divide-cream-100 max-h-60 sm:max-h-72 overflow-y-auto py-2">
                {items.map((item) => (
                  <div key={item.product.id} className="py-2.5 flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl bg-cream-100 overflow-hidden shrink-0">
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-stone-900 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        {item.quantity} × {formatINR(item.product.price)}
                      </p>
                    </div>
                    <span className="text-xs font-black text-stone-900 shrink-0">
                      {formatINR(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="pt-3 border-t border-cream-100 space-y-2 text-xs font-semibold text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-stone-900">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Delivery / Handling Fee</span>
                  <span className="font-bold">FREE (Room Pickup)</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Convenience / Platform Fee</span>
                  <span className="font-bold">₹0.00</span>
                </div>

                <div className="pt-3 border-t border-cream-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-stone-900">Total Payable</span>
                  <span className="text-2xl font-black text-brand-dark">
                    {formatINR(subtotal)}
                  </span>
                </div>
              </div>

              {/* Security info */}
              <div className="mt-4 pt-3 border-t border-cream-100 flex items-center gap-2 text-[11px] text-stone-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Direct UPI Transfer • Zero Platform Fees</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

