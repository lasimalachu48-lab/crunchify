"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { Order } from "@/types";
import { formatINR, formatDate } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";
import {
  Package,
  ShoppingBag,
  Clock,
  MapPin,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  User,
  Mail,
  Phone,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  LogOut,
} from "lucide-react";

export default function MyOrdersPage() {
  const { customer, setIsAuthModalOpen, logoutCustomer } = useCustomerAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const fetchCustomerOrders = async (email: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/customer/orders?email=${encodeURIComponent(email)}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Error fetching customer orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customer?.email) {
      fetchCustomerOrders(customer.email);
      // Fast refresh every 4 seconds so status changes from admin appear lively
      const interval = setInterval(() => {
        fetchCustomerOrders(customer.email);
      }, 4000);
      return () => clearInterval(interval);
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [customer?.email]);

  if (!customer) {
    return (
      <div className="max-w-xl mx-auto my-16 px-4 text-center">
        <div className="bg-white rounded-4xl p-8 sm:p-12 border border-cream-200 shadow-card">
          <div className="w-16 h-16 rounded-3xl bg-orange-100 text-brand-orange flex items-center justify-center mx-auto mb-4 shadow-xs">
            <User className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Customer Orders Portal
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-2 max-w-md mx-auto">
            Sign in with your email or Google account to view your past snacks, monitor active prep in real-time, and get pickup alerts for Room 1246.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-brand-orange hover:bg-brand-orange-dark text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>Sign In with Email / Google</span>
            </button>
            <Link
              href="/track"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-cream-100 hover:bg-cream-200 text-stone-700 font-bold text-xs transition-colors"
            >
              Track with Reference Code
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeOrders = orders.filter(
    (o) => o.status !== "collected" && o.status !== "cancelled"
  );
  const completedOrders = orders.filter(
    (o) => o.status === "collected" || o.status === "cancelled"
  );

  const displayedOrders =
    filter === "active"
      ? activeOrders
      : filter === "completed"
      ? completedOrders
      : orders;

  return (
    <div className="max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
      {/* Customer Header Profile Card */}
      <div className="bg-white rounded-3xl sm:rounded-4xl p-4 sm:p-8 border border-cream-200 shadow-card mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-orange text-white font-black text-lg sm:text-xl flex items-center justify-center shadow-snack shrink-0">
              {customer.name?.charAt(0).toUpperCase() || customer.email.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black text-stone-900 tracking-tight truncate">
                  {customer.name || "Crunchify Snacker"}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] sm:text-[10px] font-black uppercase shrink-0">
                  Verified
                </span>
              </div>
              <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5 truncate">
                <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span className="truncate">{customer.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={() => fetchCustomerOrders(customer.email)}
              className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-cream-100 hover:bg-cream-200 text-stone-700 text-xs font-bold transition-colors flex items-center gap-1.5 min-h-[38px]"
              title="Refresh Orders"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? "animate-spin text-brand-orange" : ""}`} />
              <span className="text-xs">Refresh</span>
            </button>
            <button
              onClick={logoutCustomer}
              className="px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-cream-100 hover:bg-red-50 text-stone-600 hover:text-red-700 text-xs font-bold transition-colors flex items-center gap-1.5 min-h-[38px]"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-cream-100 text-xs">
          <div className="bg-cream-50 rounded-2xl p-2.5 sm:p-3 border border-cream-200">
            <span className="text-stone-400 font-bold uppercase text-[9px] sm:text-[10px] block">Total Orders</span>
            <span className="text-base sm:text-lg font-black text-stone-900 mt-0.5 block">{orders.length}</span>
          </div>
          <div className="bg-orange-50 rounded-2xl p-2.5 sm:p-3 border border-orange-200">
            <span className="text-brand-orange font-bold uppercase text-[9px] sm:text-[10px] block">In Progress</span>
            <span className="text-base sm:text-lg font-black text-brand-orange mt-0.5 block">{activeOrders.length}</span>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-cream-50 rounded-2xl p-2.5 sm:p-3 border border-cream-200 flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-stone-400 font-bold uppercase text-[9px] sm:text-[10px] block">Pickup Spot</span>
              <span className="text-xs font-black text-emerald-800 mt-0.5 block flex items-center gap-1 truncate">
                <MapPin className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                <span className="truncate">Room 1246, B Block</span>
              </span>
            </div>
            <Link
              href="/catalogue"
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-brand-orange text-white text-[10px] sm:text-[11px] font-bold shadow-xs hover:bg-brand-orange-dark shrink-0"
            >
              + Order More
            </Link>
          </div>
        </div>
      </div>

      {/* Orders Filter Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all min-h-[36px] ${
            filter === "all"
              ? "bg-brand-orange text-white shadow-snack"
              : "bg-white text-stone-600 border border-cream-200 hover:bg-cream-100"
          }`}
        >
          All Orders ({orders.length})
        </button>
        <button
          onClick={() => setFilter("active")}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all min-h-[36px] ${
            filter === "active"
              ? "bg-brand-orange text-white shadow-snack"
              : "bg-white text-stone-600 border border-cream-200 hover:bg-cream-100"
          }`}
        >
          Active Now ({activeOrders.length})
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all min-h-[36px] ${
            filter === "completed"
              ? "bg-brand-orange text-white shadow-snack"
              : "bg-white text-stone-600 border border-cream-200 hover:bg-cream-100"
          }`}
        >
          Past Orders ({completedOrders.length})
        </button>
      </div>

      {/* Orders List */}
      {displayedOrders.length === 0 ? (
        <div className="bg-white rounded-3xl sm:rounded-4xl p-8 sm:p-12 text-center border border-cream-200 shadow-card">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-cream-100 text-stone-400 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-stone-900 mb-1">
            {filter === "active" ? "No Active Orders Right Now" : "No Orders Found"}
          </h3>
          <p className="text-xs text-stone-500 mb-6 max-w-sm mx-auto">
            {filter === "active"
              ? "All your previous snack orders have been picked up from Room 1246!"
              : "You haven't placed an order with this email yet. Explore our delicious snacks and combos!"}
          </p>
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-orange text-white text-xs font-bold shadow-md hover:bg-brand-orange-dark transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Explore Snacks Menu</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {displayedOrders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-cream-200 shadow-card hover:shadow-lg transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-cream-100">
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                  <span className="font-mono text-xs sm:text-sm font-black text-stone-900 uppercase">
                    #{ord.order_reference}
                  </span>
                  <OrderStatusBadge status={ord.status} />
                  <span className="text-[10px] sm:text-[11px] text-stone-400">
                    {formatDate(ord.created_at)}
                  </span>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0">
                  <span className="text-base sm:text-lg font-black text-brand-dark">
                    {formatINR(ord.total_amount)}
                  </span>
                  <Link
                    href={`/track/${ord.order_reference}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-orange hover:bg-brand-orange-dark text-white font-bold text-xs shadow-xs transition-all active:scale-95 min-h-[34px]"
                  >
                    <span>Track Lively</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Items in this order */}
              <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] sm:text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Ordered Items
                  </span>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {ord.items?.map((it, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-cream-50 border border-cream-200 text-[11px] sm:text-xs font-bold text-stone-800"
                      >
                        {it.quantity}× {it.product_name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[9px] sm:text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Pickup Location
                  </span>
                  <span className="text-xs font-black text-emerald-800 flex items-center sm:justify-end gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                    <span className="truncate max-w-[200px]">{ord.pickup_location || "Room 1246, B Block"}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
