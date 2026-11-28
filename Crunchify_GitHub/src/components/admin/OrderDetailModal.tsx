"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Order, OrderStatus } from "@/types";
import { formatINR, getStatusDetails, getPaymentStatusDetails } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";
import {
  X,
  Phone,
  MapPin,
  Check,
  XCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  PackageCheck,
  PartyPopper,
  Clock,
  Loader2,
  FileCheck2,
  Mail,
} from "lucide-react";

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  onOrderUpdated: (updated: Order) => void;
}

export function OrderDetailModal({
  order,
  onClose,
  onOrderUpdated,
}: OrderDetailModalProps) {
  const [loadingAction, setLoadingAction] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [copiedUtr, setCopiedUtr] = useState(false);

  if (!order) return null;

  const handleCopyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(true);
    setTimeout(() => setCopiedUtr(false), 2000);
  };

  const handleVerifyPayment = async (decision: "approve" | "reject") => {
    try {
      setLoadingAction(true);
      const res = await fetch("/api/orders/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          decision,
          rejectionReason: decision === "reject" ? rejectReason : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onOrderUpdated(data.order);
        setShowRejectInput(false);
      }
    } catch (err) {
      console.error("Error verifying payment:", err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    try {
      setLoadingAction(true);
      const res = await fetch("/api/orders/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          status: newStatus,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onOrderUpdated(data.order);
      }
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setLoadingAction(false);
    }
  };

  const paymentDetails = getPaymentStatusDetails(order.payment_status);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3.5 sm:p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-[#35251D]/60 backdrop-blur-xs" />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-4xl border border-cream-200 shadow-2xl z-10 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-cream-200 flex items-center justify-between bg-cream-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black text-stone-500 uppercase">
                #{order.order_reference}
              </span>
              <OrderStatusBadge status={order.status} />
            </div>
            <h2 className="text-xl font-black text-stone-900 mt-1">
              Order Details & Verification
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-cream-200 text-stone-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Customer & Location Card */}
          <div className="bg-cream-50 rounded-2xl p-4 border border-cream-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-stone-400 font-bold uppercase tracking-wider block">Customer</span>
              <span className="font-black text-stone-900 text-sm block mt-0.5">{order.customer_name}</span>
            </div>
            <div>
              <span className="text-stone-400 font-bold uppercase tracking-wider block">Customer Email</span>
              {order.customer_email ? (
                <a
                  href={`mailto:${order.customer_email}`}
                  className="font-bold text-blue-600 text-xs sm:text-sm flex items-center gap-1 mt-0.5 hover:underline truncate"
                  title={order.customer_email}
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{order.customer_email}</span>
                </a>
              ) : (
                <span className="text-stone-400 text-xs italic block mt-0.5">Not provided</span>
              )}
            </div>
            <div>
              <span className="text-stone-400 font-bold uppercase tracking-wider block">Phone Number</span>
              <a
                href={`tel:${order.phone_number}`}
                className="font-bold text-brand-orange text-sm flex items-center gap-1 mt-0.5 hover:underline"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{order.phone_number}</span>
              </a>
            </div>
            <div>
              <span className="text-stone-400 font-bold uppercase tracking-wider block">Room / Pickup ID</span>
              <span className="font-black text-emerald-800 text-sm flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{order.pickup_location}</span>
              </span>
            </div>
          </div>

          {order.notes && (
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
              <strong>Customer Note:</strong> {order.notes}
            </div>
          )}

          {/* Payment Verification Box */}
          <div className="bg-white rounded-2xl border-2 border-dashed border-cream-300 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-brand-orange" />
                <span>Payment Verification Status</span>
              </h3>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${paymentDetails.color}`}>
                {paymentDetails.label}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-cream-50 p-3 rounded-xl">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Submitted UTR / Ref</span>
                <span className="font-mono text-sm font-bold text-stone-900 select-all">
                  {order.upi_reference || "No UTR submitted yet"}
                </span>
              </div>

              {order.upi_reference && (
                <button
                  onClick={() => handleCopyUtr(order.upi_reference!)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-700 hover:bg-cream-100 flex items-center gap-1 shadow-xs"
                >
                  {copiedUtr ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy UTR</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Payment Screenshot if uploaded */}
            {order.payment_screenshot_url && (
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1.5">
                  Payment Screenshot Proof
                </span>
                <div className="relative w-40 h-40 rounded-2xl overflow-hidden border border-cream-300 group">
                  <Image
                    src={order.payment_screenshot_url}
                    alt="Payment Proof"
                    fill
                    className="object-cover cursor-pointer group-hover:scale-105 transition-transform"
                    onClick={() => {
                      if (order.payment_screenshot_url) {
                        window.open(order.payment_screenshot_url, "_blank");
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                    Click to Open Full View
                  </div>
                </div>
              </div>
            )}

            {/* Approve / Reject Actions (when pending or under verification) */}
            {order.payment_status !== "paid" && order.status !== "cancelled" && (
              <div className="pt-2 border-t border-cream-200 space-y-3">
                <span className="text-xs font-bold text-stone-600 block">
                  Verify or Reject Payment:
                </span>

                {showRejectInput ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Reason (e.g. UTR not matching statement)"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-red-300 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerifyPayment("reject")}
                        disabled={loadingAction}
                        className="px-4 py-2 rounded-xl bg-brand-red text-white text-xs font-bold hover:bg-red-700"
                      >
                        Confirm Rejection
                      </button>
                      <button
                        onClick={() => setShowRejectInput(false)}
                        className="px-3 py-2 rounded-xl bg-stone-100 text-stone-600 text-xs font-semibold"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleVerifyPayment("approve")}
                      disabled={loadingAction}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      {loadingAction ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Approve Payment & Deduct Stock</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setShowRejectInput(true)}
                      disabled={loadingAction}
                      className="py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-brand-red text-xs font-bold transition-colors"
                    >
                      Reject Payment
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Ordered Items Table */}
          <div>
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Ordered Munchies
            </h3>
            <div className="bg-cream-50 rounded-2xl p-4 border border-cream-200 divide-y divide-cream-200">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-stone-900">{item.product_name}</span>
                    <span className="text-stone-500 block text-[11px]">
                      {item.quantity} × {formatINR(item.price)}
                    </span>
                  </div>
                  <span className="font-black text-stone-900">{formatINR(item.total_price)}</span>
                </div>
              ))}

              <div className="pt-3 flex justify-between items-baseline font-bold">
                <span className="text-stone-600">Total Order Amount</span>
                <span className="text-lg font-black text-brand-dark">{formatINR(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Order Status Advancement Stepper Buttons */}
          <div className="pt-2 border-t border-cream-200 space-y-3">
            <span className="text-xs font-bold text-stone-600 block">
              Update Order Fulfillment Stage:
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handleUpdateStatus("preparing")}
                disabled={loadingAction || order.status === "preparing"}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  order.status === "preparing"
                    ? "bg-orange-500 text-white shadow-xs"
                    : "bg-cream-100 text-stone-700 hover:bg-orange-100 hover:text-brand-orange"
                }`}
              >
                Packing Snacks
              </button>

              <button
                onClick={() => handleUpdateStatus("ready_for_pickup")}
                disabled={loadingAction || order.status === "ready_for_pickup"}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  order.status === "ready_for_pickup"
                    ? "bg-green-600 text-white shadow-xs animate-pulse"
                    : "bg-cream-100 text-stone-700 hover:bg-green-100 hover:text-green-800"
                }`}
              >
                Ready for Pickup!
              </button>

              <button
                onClick={() => handleUpdateStatus("collected")}
                disabled={loadingAction || order.status === "collected"}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  order.status === "collected"
                    ? "bg-stone-800 text-white shadow-xs"
                    : "bg-cream-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                Handed Over
              </button>

              <button
                onClick={() => handleUpdateStatus("cancelled")}
                disabled={loadingAction || order.status === "cancelled"}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  order.status === "cancelled"
                    ? "bg-red-700 text-white shadow-xs"
                    : "bg-cream-100 text-stone-700 hover:bg-red-100 hover:text-red-700"
                }`}
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
