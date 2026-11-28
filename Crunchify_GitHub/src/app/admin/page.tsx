"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardStats, Order, Product } from "@/types";
import { formatINR } from "@/lib/utils";
import { MetricCard } from "@/components/admin/MetricCard";
import { OrderDetailModal } from "@/components/admin/OrderDetailModal";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";
import {
  IndianRupee,
  ShoppingBag,
  Clock,
  PackageCheck,
  AlertTriangle,
  ArrowRight,
  Plus,
  RefreshCw,
  Eye,
  Layers,
  Sparkles,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalOrders: 0,
    pendingOrders: 0,
    availableProducts: 0,
    lowStockProducts: 0,
    readyForPickup: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/orders/all"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.stats) setStats(statsData.stats);
      }
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (ordersData.orders) setRecentOrders(ordersData.orders.slice(0, 6));
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Periodic refresh every 10 seconds
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleOrderUpdated = (updated: Order) => {
    setSelectedOrder(updated);
    setRecentOrders((prev) =>
      prev.map((o) => (o.id === updated.id ? updated : o))
    );
    loadData();
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Business Overview
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Real-time analytics for your local snack & chips pickup store
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2.5 rounded-2xl bg-white border border-cream-200 text-stone-600 hover:text-stone-900 shadow-xs transition-colors"
            title="Refresh stats"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-brand-orange" : ""}`} />
          </button>

          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-orange hover:bg-brand-orange-dark text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Low Stock Urgent Alert */}
      {stats.lowStockProducts > 0 && (
        <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-amber-900 text-sm">
                Low Inventory Warning!
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                {stats.lowStockProducts} items are below the stock threshold. Restock soon to prevent missed sales.
              </p>
            </div>
          </div>

          <Link
            href="/admin/inventory"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs shrink-0"
          >
            Review Stock
          </Link>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6">
        <MetricCard
          title="Total Sales"
          value={formatINR(stats.totalSales)}
          subtitle="Verified UPI orders"
          icon={<IndianRupee className="w-5 h-5 text-emerald-600" />}
          badgeColor="bg-emerald-100 text-emerald-800"
        />

        <MetricCard
          title="Total Orders"
          value={stats.totalOrders}
          subtitle="All-time requests"
          icon={<ShoppingBag className="w-5 h-5 text-blue-600" />}
        />

        <MetricCard
          title="Pending Orders"
          value={stats.pendingOrders}
          subtitle="Needs verification"
          icon={<Clock className="w-5 h-5 text-brand-orange" />}
          badge={stats.pendingOrders > 0 ? "Action Required" : undefined}
          badgeColor="bg-red-100 text-brand-red"
        />

        <MetricCard
          title="Ready For Pickup"
          value={stats.readyForPickup}
          subtitle="Awaiting pickup"
          icon={<PackageCheck className="w-5 h-5 text-purple-600" />}
        />

        <MetricCard
          title="Active Products"
          value={stats.availableProducts}
          subtitle={`${stats.lowStockProducts} low on stock`}
          icon={<Layers className="w-5 h-5 text-stone-700" />}
        />
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl sm:rounded-4xl p-4 sm:p-8 border border-cream-200 shadow-card">
        <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-cream-100">
          <div>
            <h2 className="text-base sm:text-lg font-black text-stone-900">
              Recent Customer Orders
            </h2>
            <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">
              Live updates of incoming snack requests
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:text-brand-orange-dark group"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-8 sm:py-12 text-center text-stone-400 text-xs font-medium">
            No orders placed yet. Place a test order from the customer store!
          </div>
        ) : (
          <>
            {/* Mobile Cards (visible on <sm) */}
            <div className="block sm:hidden divide-y divide-cream-100 space-y-3">
              {recentOrders.map((ord) => (
                <div key={ord.id} className="pt-3 first:pt-0 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-stone-800">
                      #{ord.order_reference}
                    </span>
                    <span className="font-black text-stone-900 text-sm">
                      {formatINR(ord.total_amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-900">{ord.customer_name}</span>
                    <OrderStatusBadge status={ord.status} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span>{ord.pickup_location}</span>
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="px-2.5 py-1 rounded-lg bg-cream-100 text-brand-orange font-bold text-xs"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table (visible on sm+) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-cream-200 text-stone-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Reference</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Pickup Room</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Order Status</th>
                    <th className="pb-3 text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-cream-50/60 transition-colors">
                      <td className="py-3.5 pl-2 font-mono font-bold text-stone-800">
                        #{ord.order_reference}
                      </td>
                      <td className="py-3.5 font-bold text-stone-900">
                        <div>{ord.customer_name}</div>
                        {ord.customer_email && (
                          <div className="text-[10px] text-blue-600 font-normal truncate max-w-[150px]" title={ord.customer_email}>
                            {ord.customer_email}
                          </div>
                        )}
                        <div className="text-[10px] text-stone-400 font-normal">{ord.phone_number}</div>
                      </td>
                      <td className="py-3.5 font-semibold text-stone-700">
                        {ord.pickup_location}
                      </td>
                      <td className="py-3.5 font-black text-stone-900">
                        {formatINR(ord.total_amount)}
                      </td>
                      <td className="py-3.5">
                        <OrderStatusBadge status={ord.status} />
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-stone-800 font-bold text-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Order Detail & Verification Modal */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onOrderUpdated={handleOrderUpdated}
      />
    </div>
  );
}

