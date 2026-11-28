"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Order, OrderStatus } from "@/types";
import { formatINR } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";
import { OrderDetailModal } from "@/components/admin/OrderDetailModal";
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  Clock,
  Phone,
  MapPin,
  ShieldAlert,
  Mail,
} from "lucide-react";

function OrdersContent() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get("status") || "all";

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders/all");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Fast polling every 2.5 seconds for instant real-time order monitoring
    const interval = setInterval(fetchOrders, 2500);
    return () => clearInterval(interval);
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // Status filter
      let matchesStatus = true;
      if (statusFilter === "pending") {
        matchesStatus =
          ord.status === "pending_payment" ||
          ord.status === "payment_under_verification";
      } else if (statusFilter !== "all") {
        matchesStatus = ord.status === statusFilter;
      }

      // Search filter
      const q = search.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        ord.order_reference.toLowerCase().includes(q) ||
        ord.customer_name.toLowerCase().includes(q) ||
        (ord.customer_email && ord.customer_email.toLowerCase().includes(q)) ||
        ord.phone_number.includes(q) ||
        ord.pickup_location.toLowerCase().includes(q) ||
        (ord.upi_reference && ord.upi_reference.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, search]);

  const handleOrderUpdated = (updated: Order) => {
    setSelectedOrder(updated);
    setOrders((prev) =>
      prev.map((o) => (o.id === updated.id ? updated : o))
    );
  };

  const tabs = [
    { id: "all", label: "All Orders", count: orders.length },
    {
      id: "pending",
      label: "Needs Verification",
      count: orders.filter(
        (o) =>
          o.status === "pending_payment" ||
          o.status === "payment_under_verification"
      ).length,
    },
    {
      id: "confirmed",
      label: "Confirmed",
      count: orders.filter((o) => o.status === "confirmed").length,
    },
    {
      id: "preparing",
      label: "Packing",
      count: orders.filter((o) => o.status === "preparing").length,
    },
    {
      id: "ready_for_pickup",
      label: "Ready for Pickup",
      count: orders.filter((o) => o.status === "ready_for_pickup").length,
    },
    {
      id: "collected",
      label: "Collected",
      count: orders.filter((o) => o.status === "collected").length,
    },
    {
      id: "cancelled",
      label: "Cancelled",
      count: orders.filter((o) => o.status === "cancelled").length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Order Fulfillment & Verification
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Verify customer UPI payments, manage fulfillment statuses, and mark orders as collected
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="self-start sm:self-auto p-2.5 rounded-2xl bg-white border border-cream-200 text-stone-600 hover:text-stone-900 shadow-xs transition-colors flex items-center gap-1.5 text-xs font-bold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-brand-orange" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="overflow-x-auto no-scrollbar pb-1">
        <div className="flex items-center gap-2 min-w-max">
          {tabs.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-brand-orange text-white shadow-snack"
                    : "bg-white text-stone-600 border border-cream-200 hover:bg-cream-100"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-cream-100 text-stone-700"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white rounded-3xl p-4 border border-cream-200 shadow-card flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order Ref (#CRUNCH-...), customer name, room number, or UTR..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-cream-50 border border-cream-200 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
          />
        </div>
      </div>

      {/* Orders View */}
      <div className="bg-white rounded-3xl sm:rounded-4xl border border-cream-200 shadow-card overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-stone-400 text-xs font-medium">
            No orders found matching this filter criteria.
          </div>
        ) : (
          <>
            {/* Mobile Cards (visible on <sm) */}
            <div className="block sm:hidden divide-y divide-cream-100 p-3 space-y-3">
              {filteredOrders.map((ord) => (
                <div key={ord.id} className="pt-3 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs text-stone-800">
                      #{ord.order_reference}
                    </span>
                    <span className="font-black text-stone-900 text-sm">
                      {formatINR(ord.total_amount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-xs text-stone-900 truncate">
                      {ord.customer_name}
                    </div>
                    <OrderStatusBadge status={ord.status} />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <div className="flex items-center gap-1 text-emerald-800 font-semibold truncate">
                      <MapPin className="w-3 h-3 text-brand-orange shrink-0" />
                      <span className="truncate">{ord.pickup_location}</span>
                    </div>
                    <a
                      href={`tel:${ord.phone_number}`}
                      className="text-brand-orange font-bold flex items-center gap-1 shrink-0"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{ord.phone_number}</span>
                    </a>
                  </div>

                  <div className="text-[11px] text-stone-600 truncate">
                    {ord.items?.map((it) => `${it.quantity}x ${it.product_name}`).join(", ")}
                  </div>

                  <button
                    onClick={() => setSelectedOrder(ord)}
                    className="w-full py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange-dark text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all mt-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Verify / Manage Order</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop / Tablet Table (visible on sm+) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cream-50 border-b border-cream-200 text-stone-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 pl-6">Ref ID</th>
                    <th className="py-3.5">Customer &amp; Phone</th>
                    <th className="py-3.5">Pickup Location</th>
                    <th className="py-3.5">Items Summary</th>
                    <th className="py-3.5">Amount</th>
                    <th className="py-3.5">Status</th>
                    <th className="py-3.5 text-right pr-6">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-cream-50/50 transition-colors">
                      <td className="py-4 pl-6 font-mono font-black text-stone-800">
                        #{ord.order_reference}
                      </td>

                      <td className="py-4">
                        <div className="font-bold text-stone-900">{ord.customer_name}</div>
                        {ord.customer_email && (
                          <a
                            href={`mailto:${ord.customer_email}`}
                            className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1 mt-0.5"
                            title={ord.customer_email}
                          >
                            <Mail className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[170px]">{ord.customer_email}</span>
                          </a>
                        )}
                        <a
                          href={`tel:${ord.phone_number}`}
                          className="text-[11px] text-brand-orange font-semibold hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-3 h-3 shrink-0" />
                          <span>{ord.phone_number}</span>
                        </a>
                      </td>

                      <td className="py-4">
                        <div className="font-bold text-emerald-800 flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>{ord.pickup_location}</span>
                        </div>
                        {ord.notes && (
                          <div className="text-[10px] text-stone-400 italic truncate max-w-xs">
                            &ldquo;{ord.notes}&rdquo;
                          </div>
                        )}
                      </td>

                      <td className="py-4 max-w-xs">
                        <div className="text-stone-700 truncate font-medium">
                          {ord.items?.map((it) => `${it.quantity}x ${it.product_name}`).join(", ")}
                        </div>
                      </td>

                      <td className="py-4 font-black text-stone-900 text-sm">
                        {formatINR(ord.total_amount)}
                      </td>

                      <td className="py-4">
                        <OrderStatusBadge status={ord.status} />
                      </td>

                      <td className="py-4 text-right pr-6">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-orange hover:bg-brand-orange-dark text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Verify / Edit</span>
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

      {/* Modal */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onOrderUpdated={handleOrderUpdated}
      />
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-stone-400">Loading orders...</div>}>
      <OrdersContent />
    </Suspense>
  );
}

