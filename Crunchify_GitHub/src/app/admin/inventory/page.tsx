"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Product, InventoryLog } from "@/types";
import { StockAdjustModal } from "@/components/admin/StockAdjustModal";
import {
  Layers,
  AlertTriangle,
  RefreshCw,
  Plus,
  Minus,
  Clock,
  History,
  CheckCircle2,
} from "lucide-react";

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, logsRes] = await Promise.all([
        fetch("/api/products?all=true"),
        fetch("/api/inventory"),
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData.products || []);
      }
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData.logs || []);
      }
    } catch (err) {
      console.error("Failed to load inventory data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickAdjust = async (product: Product, delta: number) => {
    const targetStock = Math.max(0, product.stock + delta);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          newStock: targetStock,
          reason: delta > 0 ? "Quick Restock (+1)" : "Quick Deduction (-1)",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? data.product : p))
        );
        // Refresh logs
        const logsRes = await fetch("/api/inventory");
        if (logsRes.ok) {
          const logsData = await logsRes.json();
          setLogs(logsData.logs || []);
        }
      }
    } catch (err) {
      console.error("Quick adjust failed:", err);
    }
  };

  const lowStockThreshold = 5;
  const lowStockItems = products.filter((p) => p.is_active && p.stock <= lowStockThreshold);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Inventory & Stock Logs
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Real-time stock auditing, automatic order deductions, and low-inventory alerts
          </p>
        </div>

        <button
          onClick={loadData}
          className="self-start sm:self-auto p-2.5 rounded-2xl bg-white border border-cream-200 text-stone-600 hover:text-stone-900 shadow-xs transition-colors flex items-center gap-1.5 text-xs font-bold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-brand-orange" : ""}`} />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* Low Stock Warning Card */}
      {lowStockItems.length > 0 && (
        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <h3 className="text-sm font-bold text-amber-900">
              Low Stock Alert ({lowStockItems.length} items critical)
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockItems.map((item) => (
              <span
                key={item.id}
                onClick={() => setAdjustingProduct(item)}
                className="px-3 py-1.5 rounded-xl bg-white border border-amber-200 text-xs font-bold text-amber-900 hover:bg-amber-100 cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>{item.name}:</span>
                <span className="text-red-600 font-black">{item.stock} left</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Current Stock Levels Grid */}
      <div className="bg-white rounded-4xl border border-cream-200 shadow-card overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-cream-100">
          <h2 className="text-base font-bold text-stone-900">
            Current Snack Inventory Levels
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Use the quick +/- buttons or click &apos;Adjust&apos; for custom batch restocks
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-50 border-b border-cream-200 text-stone-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-6">Snack</th>
                <th className="py-3.5">Category</th>
                <th className="py-3.5">Current Stock</th>
                <th className="py-3.5">Status</th>
                <th className="py-3.5 text-right pr-6">Quick Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {products.map((prod) => {
                const isOut = prod.stock <= 0;
                const isLow = prod.stock > 0 && prod.stock <= lowStockThreshold;

                return (
                  <tr key={prod.id} className="hover:bg-cream-50/50 transition-colors">
                    <td className="py-3.5 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl bg-cream-100 overflow-hidden shrink-0">
                          <Image
                            src={prod.image_url}
                            alt={prod.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="font-bold text-stone-900 text-xs sm:text-sm">
                          {prod.name}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 font-semibold text-stone-600">
                      {prod.category?.name || "Snack"}
                    </td>

                    <td className="py-3.5 font-black text-stone-900 text-sm">
                      {prod.stock} units
                    </td>

                    <td className="py-3.5">
                      {isOut ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-200">
                          OUT OF STOCK
                        </span>
                      ) : isLow ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                          LOW STOCK
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                          IN STOCK
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 text-right pr-6">
                      <div className="inline-flex items-center gap-1.5 bg-cream-100 border border-cream-200 rounded-xl p-1">
                        <button
                          onClick={() => handleQuickAdjust(prod, -1)}
                          disabled={prod.stock <= 0}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-stone-800 hover:bg-red-50 hover:text-red-600 active:scale-95 disabled:opacity-40 transition-colors"
                          title="Deduct 1"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleQuickAdjust(prod, 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-stone-800 hover:bg-emerald-50 hover:text-emerald-700 active:scale-95 transition-colors"
                          title="Add 1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setAdjustingProduct(prod)}
                          className="px-2.5 py-1 rounded-lg bg-white text-brand-orange hover:bg-brand-orange hover:text-white font-bold text-[11px] transition-colors"
                        >
                          Set
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Audit Logs Table */}
      <div className="bg-white rounded-4xl border border-cream-200 shadow-card overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-cream-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-brand-orange" />
            <h2 className="text-base font-bold text-stone-900">
              Audit Trail (Inventory Change Logs)
            </h2>
          </div>
          <span className="text-xs text-stone-400 font-semibold">
            {logs.length} logged events
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="p-10 text-center text-stone-400 text-xs">
            No stock changes logged yet. Any order confirmation or manual edit will record an audit trail entry here.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-cream-200 text-stone-400 font-bold uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="py-3 pl-6">Time</th>
                  <th className="py-3">Product</th>
                  <th className="py-3">Change</th>
                  <th className="py-3">Stock Before → After</th>
                  <th className="py-3">Reason / Trigger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {logs.map((log) => {
                  const isPositive = log.change_amount > 0;

                  return (
                    <tr key={log.id} className="hover:bg-cream-50/50">
                      <td className="py-3 pl-6 text-stone-500 font-mono text-[11px]">
                        {new Date(log.created_at).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td className="py-3 font-bold text-stone-900">
                        {log.product_name || "Snack Item"}
                      </td>

                      <td className="py-3 font-black">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isPositive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {isPositive ? `+${log.change_amount}` : log.change_amount}
                        </span>
                      </td>

                      <td className="py-3 text-stone-600 font-mono">
                        {log.previous_stock} →{" "}
                        <strong className="text-stone-900 font-bold">{log.new_stock}</strong>
                      </td>

                      <td className="py-3 text-stone-600 capitalize">
                        {log.reason.replace(/_/g, " ")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock Adjust Modal */}
      {adjustingProduct && (
        <StockAdjustModal
          product={adjustingProduct}
          onClose={() => setAdjustingProduct(null)}
          onStockUpdated={(updated) => {
            setProducts((prev) =>
              prev.map((p) => (p.id === updated.id ? updated : p))
            );
            loadData();
          }}
        />
      )}
    </div>
  );
}

