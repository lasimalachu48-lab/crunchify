"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Order, OrderStatus } from "@/types";
import { formatINR, getStatusDetails, getPaymentStatusDetails } from "@/lib/utils";
import { useStore } from "@/context/StoreContext";
import { UpiQrCode } from "@/components/ui/UpiQrCode";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";
import confetti from "canvas-confetti";
import { playChime } from "@/lib/audio";
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  PackageCheck,
  PartyPopper,
  Check,
  XCircle,
  Copy,
  ExternalLink,
  UploadCloud,
  RefreshCw,
  Phone,
  MapPin,
  AlertCircle,
  FileCheck2,
  Sparkles,
  ArrowLeft,
  Loader2,
} from "lucide-react";

export default function OrderTrackDetailPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const routeParams = useParams();
  const [unwrappedRef, setUnwrappedRef] = useState<string>((routeParams?.ref as string) || "");

  useEffect(() => {
    if (params) {
      Promise.resolve(params).then((p) => {
        if (p?.ref) setUnwrappedRef(p.ref);
      });
    }
  }, [params]);

  const ref = unwrappedRef || (routeParams?.ref as string) || "";
  const { settings } = useStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Payment Submission States
  const [utrNumber, setUtrNumber] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);
  const [paymentErrorMsg, setPaymentErrorMsg] = useState<string | null>(null);

  const fetchOrder = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setRefreshing(true);
      const res = await fetch(`/api/orders/${ref}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError(`Order reference "${ref}" was not found.`);
        } else {
          setError("Failed to fetch order information.");
        }
        return;
      }
      const data = await res.json();
      const newOrder = data.order;

      // Detect status change to trigger sound & confetti
      if (order && newOrder && order.status !== newOrder.status) {
        if (newOrder.status === "confirmed" || newOrder.status === "ready_for_pickup" || newOrder.status === "collected") {
          playChime("new_order");
          confetti({
            particleCount: 70,
            spread: 70,
            origin: { y: 0.6 },
          });
        } else {
          playChime("pop");
        }
      }

      setOrder(newOrder);
      setError(null);
    } catch (e) {
      setError("Network error fetching order details.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [ref, order]);

  useEffect(() => {
    fetchOrder();
    // Fast live polling every 2 seconds for instant updates from admin portal
    const interval = setInterval(() => {
      fetchOrder(true);
    }, 2000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setScreenshotPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentErrorMsg(null);
    setPaymentSuccessMsg(null);

    if (!utrNumber.trim()) {
      setPaymentErrorMsg("Please enter your 12-digit UPI Reference / UTR number.");
      return;
    }

    try {
      setSubmittingPayment(true);

      let screenshotUrl: string | undefined = undefined;

      // Upload screenshot if provided
      if (screenshotFile) {
        const formData = new FormData();
        formData.append("file", screenshotFile);
        formData.append("folder", "payment-proofs");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          screenshotUrl = uploadData.url;
        }
      }

      // Submit payment reference
      const res = await fetch(`/api/orders/${ref}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          upiReference: utrNumber.trim(),
          screenshotUrl: screenshotUrl || screenshotPreview || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setPaymentErrorMsg(data.error || "Failed to submit payment reference.");
        setSubmittingPayment(false);
        return;
      }

      setOrder(data.order);
      setPaymentSuccessMsg("Reference submitted! Admin will verify and prepare your snacks.");
    } catch (err) {
      setPaymentErrorMsg("Error submitting payment reference. Please try again.");
    } finally {
      setSubmittingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center max-w-md mx-auto px-4">
        <div className="w-12 h-12 rounded-full border-4 border-brand-orange border-t-transparent animate-spin mx-auto mb-4" />
        <h2 className="font-bold text-stone-800 text-base">Loading order details...</h2>
        <p className="text-xs text-stone-500 mt-1">Checking live status for #{ref}</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-16 max-w-md mx-auto px-4 text-center">
        <div className="bg-white rounded-4xl p-8 border border-cream-200 shadow-card">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">Order Not Found</h2>
          <p className="text-xs text-stone-500 mb-6">
            We couldn&apos;t find any order with reference <span className="font-mono font-bold">{ref}</span>.
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href="/track"
              className="px-6 py-3 rounded-2xl bg-brand-orange hover:bg-brand-orange-dark text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              Search Another Reference
            </Link>
            <Link
              href="/"
              className="px-6 py-3 rounded-2xl bg-cream-100 text-stone-700 font-bold text-xs hover:bg-cream-200"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Stepper milestones
  const steps: { key: OrderStatus; label: string; icon: React.ReactNode }[] = [
    { key: "pending_payment", label: "Pay UPI", icon: <Clock className="w-4 h-4" /> },
    { key: "payment_under_verification", label: "Verifying", icon: <ShieldCheck className="w-4 h-4" /> },
    { key: "confirmed", label: "Confirmed", icon: <CheckCircle2 className="w-4 h-4" /> },
    { key: "preparing", label: "Packing", icon: <PackageCheck className="w-4 h-4" /> },
    { key: "ready_for_pickup", label: "Ready!", icon: <PartyPopper className="w-4 h-4" /> },
    { key: "collected", label: "Collected", icon: <Check className="w-4 h-4" /> },
  ];

  const currentStepDetails = getStatusDetails(order.status);
  const paymentDetails = getPaymentStatusDetails(order.payment_status);

  return (
    <div className="py-6 sm:py-8 md:py-14">
      <div className="max-w-4xl mx-auto px-3.5 sm:px-6 lg:px-8">
        {/* Navigation & Refresh header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-brand-orange transition-colors py-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Snack Menu</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Live Real-time Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] sm:text-[11px] font-black">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>LIVE TRACKING</span>
            </div>

            <button
              onClick={() => fetchOrder()}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white border border-cream-200 text-xs font-bold text-stone-700 hover:bg-cream-100 shadow-xs transition-colors min-h-[34px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-brand-orange" : ""}`} />
              <span className="hidden xs:inline">{refreshing ? "Syncing..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* Hero Order Status Card */}
        <div className="bg-white rounded-3xl sm:rounded-4xl p-4 sm:p-8 border border-cream-200 shadow-card mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-cream-100 pb-4 sm:pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] sm:text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Order Reference
                </span>
                <span className="px-2 py-0.5 rounded-md bg-cream-100 text-stone-800 font-mono text-xs font-black select-all">
                  #{order.order_reference}
                </span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black text-stone-900 mt-1">
                Order Status Tracking
              </h1>
            </div>

            <div className="flex flex-col sm:items-end">
              <OrderStatusBadge status={order.status} />
              <span className="text-[10px] sm:text-[11px] text-stone-400 mt-1 font-medium">
                Placed at {new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          {order.status !== "cancelled" ? (
            <div className="py-4 sm:py-8">
              <div className="grid grid-cols-6 gap-1 xs:gap-2 text-center">
                {steps.map((st, idx) => {
                  const isCompleted = currentStepDetails.step > idx + 1;
                  const isCurrent = currentStepDetails.step === idx + 1;

                  return (
                    <div key={st.key} className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all ${
                          isCompleted
                            ? "bg-emerald-500 text-white shadow-xs"
                            : isCurrent
                            ? "bg-brand-orange text-white ring-3 sm:ring-4 ring-orange-100 animate-pulse"
                            : "bg-cream-100 text-stone-400"
                        }`}
                      >
                        {st.icon}
                      </div>
                      <span
                        className={`text-[9px] xs:text-[10px] sm:text-xs font-bold mt-1.5 sm:mt-2 truncate w-full ${
                          isCurrent
                            ? "text-brand-orange font-black"
                            : isCompleted
                            ? "text-emerald-700 font-semibold"
                            : "text-stone-400 font-medium"
                        }`}
                      >
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="my-4 sm:my-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-900 text-sm">Order Cancelled</h4>
                <p className="text-xs text-red-700 mt-0.5">
                  {order.rejection_reason || "This order was cancelled."}
                </p>
              </div>
            </div>
          )}

          {/* Status Description Callout */}
          <div className="p-3 sm:p-4 rounded-2xl bg-cream-50 border border-cream-200 text-xs sm:text-sm text-stone-700 flex items-center gap-2.5 sm:gap-3">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-brand-orange shrink-0 animate-ping" />
            <p className="text-xs sm:text-sm">
              <strong>Status:</strong> {currentStepDetails.description}
            </p>
          </div>
        </div>

        {/* READY FOR PICKUP BANNER (Highlight when Ready!) */}
        {order.status === "ready_for_pickup" && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-8 rounded-3xl sm:rounded-4xl bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-600 text-white shadow-snack animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-left">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                <PartyPopper className="w-7 h-7 sm:w-9 sm:h-9 text-amber-200 animate-bounce" />
              </div>
              <div className="flex-1">
                <span className="px-2.5 py-0.5 rounded-full bg-white text-emerald-800 text-[10px] sm:text-[11px] font-black uppercase tracking-wider inline-block mb-1">
                  Ready Right Now
                </span>
                <h2 className="text-xl sm:text-3xl font-black">
                  Your Snacks Are Packed!
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
                  {settings.pickup_instructions || "Head to Room 1246 right now to collect your bag. Knock twice!"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2.5 sm:gap-4 text-xs font-bold text-white/90 justify-center sm:justify-start">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-300" />
                    Pickup ID: {order.pickup_location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-amber-300" />
                    Owner: {settings.contact_number}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Column: UPI Payment Instructions (When Pending) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            {order.status === "pending_payment" ? (
              <div className="space-y-4 sm:space-y-6">
                {/* UPI QR & Deep link Component */}
                <UpiQrCode
                  upiId={settings.upi_id || "7736190495@ptsbi"}
                  payeeName={settings.payee_name || "CRUNCHIFY SNACKS"}
                  amount={order.total_amount}
                  orderReference={order.order_reference}
                />

                {/* Form to submit UTR & Screenshot */}
                <div className="bg-white rounded-3xl p-4 sm:p-8 border border-cream-200 shadow-card">
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 border-b border-cream-100 pb-3 flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-brand-orange" />
                    <span>Submit Payment Verification</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-2 mb-4">
                    After completing the transfer on Google Pay, PhonePe, Paytm or BHIM, copy the 12-digit UTR/Reference number and enter it below.
                  </p>

                  {paymentErrorMsg && (
                    <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 mb-4 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{paymentErrorMsg}</span>
                    </div>
                  )}

                  {paymentSuccessMsg && (
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 mb-4 flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{paymentSuccessMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        UPI Reference / UTR Number <span className="text-brand-red">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        placeholder="e.g. 432189012345 (usually 12 digits)"
                        className="w-full px-4 py-3 rounded-2xl bg-cream-50 border border-cream-200 font-mono text-base sm:text-sm font-bold text-stone-900 placeholder:text-stone-400 placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange min-h-[44px]"
                      />
                      <span className="text-[11px] text-stone-400 mt-1 block">
                        Found in your UPI app payment receipt under &apos;UPI Transaction ID&apos; or &apos;UTR&apos;.
                      </span>
                    </div>

                    {/* Optional Screenshot Upload */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Upload Payment Screenshot (Optional)
                      </label>
                      <div className="border-2 border-dashed border-cream-300 rounded-2xl p-4 text-center bg-cream-50/50 hover:bg-cream-100/50 transition-colors cursor-pointer relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotChange}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <UploadCloud className="w-6 h-6 sm:w-7 sm:h-7 text-stone-400 mx-auto mb-1.5" />
                        <span className="text-xs font-bold text-stone-700 block truncate">
                          {screenshotFile ? screenshotFile.name : "Tap to browse or drop screenshot"}
                        </span>
                        <span className="text-[10px] text-stone-400">PNG, JPG or WebP</span>
                      </div>

                      {screenshotPreview && (
                        <div className="mt-3 relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-cream-300">
                          <Image
                            src={screenshotPreview}
                            alt="Screenshot Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={submittingPayment}
                      className="w-full py-3.5 px-6 rounded-2xl bg-brand-orange hover:bg-brand-orange-dark text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      {submittingPayment ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting Reference...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Submit Payment for Verification</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              /* Verified / In Progress Details */
              <div className="bg-white rounded-3xl p-4 sm:p-8 border border-cream-200 shadow-card space-y-4">
                <h3 className="text-base font-bold text-stone-900 border-b border-cream-100 pb-3 flex items-center justify-between">
                  <span>Payment Verification Status</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${paymentDetails.color}`}>
                    {paymentDetails.label}
                  </span>
                </h3>

                <div className="space-y-2 text-xs text-stone-600">
                  {order.upi_reference && (
                    <div className="flex justify-between py-1 border-b border-cream-50">
                      <span className="text-stone-400 font-semibold">Submitted UTR:</span>
                      <span className="font-mono font-bold text-stone-900">{order.upi_reference}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-1 border-b border-cream-50">
                    <span className="text-stone-400 font-semibold">Payee UPI ID:</span>
                    <span className="font-mono font-bold text-stone-900">{settings.upi_id}</span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-stone-400 font-semibold">Amount Paid:</span>
                    <span className="font-bold text-brand-dark text-sm">{formatINR(order.total_amount)}</span>
                  </div>
                </div>

                {order.status === "payment_under_verification" && (
                  <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      Your UTR is currently being cross-checked with the bank statement. Orders are usually confirmed within 1-2 minutes.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Customer & Items Breakdown */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-cream-200 shadow-card">
              <h3 className="text-sm font-bold text-stone-900 border-b border-cream-100 pb-3">
                Customer &amp; Pickup Target
              </h3>

              <div className="mt-3 space-y-2.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span className="text-stone-400 font-medium">Customer:</span>
                  <span className="font-bold text-stone-900">{order.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400 font-medium">Phone:</span>
                  <span className="font-semibold text-stone-900">{order.phone_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400 font-medium">Room / Pickup ID:</span>
                  <span className="font-bold text-brand-orange">{order.pickup_location}</span>
                </div>
                {order.notes && (
                  <div className="pt-2 border-t border-cream-100">
                    <span className="text-stone-400 font-medium block">Special Notes:</span>
                    <span className="text-stone-700 italic block mt-0.5">{order.notes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Items Ordered List */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-cream-200 shadow-card">
              <h3 className="text-sm font-bold text-stone-900 border-b border-cream-100 pb-3">
                Items in This Order
              </h3>

              <div className="divide-y divide-cream-100 py-2">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-stone-900">{item.product_name}</p>
                      <p className="text-stone-400 text-[11px]">
                        {item.quantity} × {formatINR(item.price)}
                      </p>
                    </div>
                    <span className="font-black text-stone-900">{formatINR(item.total_price)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-cream-200 flex justify-between items-baseline">
                <span className="text-xs font-bold text-stone-500 uppercase">Total Amount</span>
                <span className="text-xl font-black text-brand-dark">
                  {formatINR(order.total_amount)}
                </span>
              </div>
            </div>

            {/* Need Help Box */}
            <div className="p-3.5 sm:p-4 rounded-3xl bg-cream-100 border border-cream-200 text-xs text-stone-700 flex items-center justify-between">
              <div>
                <span className="font-bold block text-stone-900">Need Immediate Help?</span>
                <span className="text-stone-500">Call owner at {settings.contact_number}</span>
              </div>
              <a
                href={`tel:${settings.contact_number}`}
                className="p-2.5 rounded-2xl bg-white text-brand-orange border border-cream-300 hover:bg-brand-orange hover:text-white transition-colors shadow-xs min-h-[38px] min-w-[38px] flex items-center justify-center"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

