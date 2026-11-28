"use client";

import React, { useState } from "react";
import { Product } from "@/types";
import { X, Check, Loader2, Layers } from "lucide-react";

interface StockAdjustModalProps {
  product: Product | null;
  onClose: () => void;
  onStockUpdated: (product: Product) => void;
}

export function StockAdjustModal({
  product,
  onClose,
  onStockUpdated,
}: StockAdjustModalProps) {
  const [newStock, setNewStock] = useState<string>(product?.stock.toString() || "0");
  const [reason, setReason] = useState<string>("restock");
  const [customNote, setCustomNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const parsedStock = parseInt(newStock, 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      setErrorMsg("Please enter a valid stock quantity (0 or greater).");
      return;
    }

    try {
      setSaving(true);
      const effectiveReason = customNote.trim()
        ? `${reason}: ${customNote.trim()}`
        : reason;

      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          newStock: parsedStock,
          reason: effectiveReason,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Failed to update stock.");
        setSaving(false);
        return;
      }

      onStockUpdated(data.product);
      onClose();
    } catch (err) {
      setErrorMsg("Network error updating inventory.");
      setSaving(false);
    }
  };

  const diff = parseInt(newStock || "0", 10) - product.stock;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3.5 sm:p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-[#35251D]/60 backdrop-blur-xs" />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-4xl border border-cream-200 shadow-2xl z-10 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-cream-200 flex items-center justify-between bg-cream-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-brand-orange flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Stock Adjustment
              </span>
              <h3 className="text-base font-black text-stone-900 truncate max-w-[240px]">
                {product.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-cream-200 text-stone-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Current Stock Banner */}
          <div className="bg-cream-50 rounded-2xl p-4 border border-cream-200 flex items-center justify-between text-xs">
            <span className="text-stone-500 font-semibold">Current Available Stock:</span>
            <span className="text-base font-black text-stone-900">{product.stock} units</span>
          </div>

          {/* New Stock Input */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              New Total Stock Quantity *
            </label>
            <input
              type="number"
              min="0"
              required
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-cream-50 border border-cream-200 font-bold text-base text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
            />
            {diff !== 0 && (
              <span
                className={`text-[11px] font-bold block mt-1 ${
                  diff > 0 ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {diff > 0 ? `+${diff} units restocked` : `${diff} units deduction`}
              </span>
            )}
          </div>

          {/* Reason Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Adjustment Reason *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-cream-50 border border-cream-200 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
            >
              <option value="restock">Fresh Stock Received (Wholesale)</option>
              <option value="manual_adjustment">Physical Count Reconciliation</option>
              <option value="damaged_or_expired">Damaged / Expired Removal</option>
              <option value="personal_consumption">Personal Consumption / Testing</option>
            </select>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Optional Audit Note
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Bought 2 fresh cartons from vendor"
              className="w-full px-3.5 py-2 rounded-2xl bg-cream-50 border border-cream-200 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-cream-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-cream-100 text-stone-700 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-brand-orange hover:bg-brand-orange-dark text-white font-bold text-xs shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Inventory</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

