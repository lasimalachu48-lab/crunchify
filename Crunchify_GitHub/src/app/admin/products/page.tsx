"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Product, Category } from "@/types";
import { formatINR } from "@/lib/utils";
import { ProductFormModal } from "@/components/admin/ProductFormModal";
import { StockAdjustModal } from "@/components/admin/StockAdjustModal";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Flame,
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustingStockProduct, setAdjustingStockProduct] = useState<Product | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, setRes] = await Promise.all([
        fetch("/api/products?all=true"),
        fetch("/api/settings"),
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData.products || []);
      }
      if (setRes.ok) {
        const setData = await setRes.json();
        setCategories(setData.categories || []);
      }
    } catch (err) {
      console.error("Failed to load products/categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const updatedStatus = !product.is_active;
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, is_active: updatedStatus }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id ? { ...p, is_active: updatedStatus } : p
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle product status:", err);
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    try {
      const updatedFeatured = !product.is_featured;
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, is_featured: updatedFeatured }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id ? { ...p, is_featured: updatedFeatured } : p
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle featured status:", err);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "all" || p.category_id === selectedCategory;
    const matchesSearch =
      search.trim() === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Product Catalogue Management
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Add snacks, update live prices, configure stock, and manage homepage feature tags
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setIsProductModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-orange hover:bg-brand-orange-dark text-white text-xs font-bold shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Snack</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-cream-200 shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search snacks by name, tags..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-cream-50 border border-cream-200 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-stone-500">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-cream-50 border border-cream-200 rounded-2xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-3xl sm:rounded-4xl border border-cream-200 shadow-card overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-stone-400 text-xs font-medium">
            No products found matching your search.
          </div>
        ) : (
          <>
            {/* Mobile Cards (visible on <sm) */}
            <div className="block sm:hidden divide-y divide-cream-100 p-3 space-y-3">
              {filteredProducts.map((prod) => (
                <div key={prod.id} className="pt-3 first:pt-0 space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl bg-cream-100 overflow-hidden shrink-0 border border-cream-200">
                      <Image
                        src={prod.image_url}
                        alt={prod.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-stone-900 text-sm truncate">
                        {prod.name}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                        <span className="font-semibold text-stone-600">{prod.category?.name || "Snack"}</span>
                        <span>•</span>
                        <span className="font-black text-stone-900">{formatINR(prod.price)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      onClick={() => setAdjustingStockProduct(prod)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold ${
                        prod.stock <= 0
                          ? "bg-red-100 text-red-800"
                          : prod.stock <= 5
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>{prod.stock} in stock</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleFeatured(prod)}
                        className={`p-1.5 rounded-xl transition-colors ${
                          prod.is_featured
                            ? "bg-amber-100 text-amber-700"
                            : "text-stone-300"
                        }`}
                        title="Toggle Featured"
                      >
                        <Flame className={`w-4 h-4 ${prod.is_featured ? "fill-amber-500 text-amber-500" : ""}`} />
                      </button>

                      <button
                        onClick={() => handleToggleActive(prod)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                          prod.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-stone-200 text-stone-600"
                        }`}
                      >
                        {prod.is_active ? "Enabled" : "Disabled"}
                      </button>

                      <button
                        onClick={() => {
                          setEditingProduct(prod);
                          setIsProductModalOpen(true);
                        }}
                        className="p-1.5 rounded-xl hover:bg-cream-100 text-stone-600 hover:text-brand-orange"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteProduct(prod.id, prod.name)}
                        className="p-1.5 rounded-xl hover:bg-red-50 text-stone-400 hover:text-brand-red"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table (visible on sm+) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cream-50 border-b border-cream-200 text-stone-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 pl-6">Snack</th>
                    <th className="py-3.5">Category</th>
                    <th className="py-3.5">Price</th>
                    <th className="py-3.5">Stock</th>
                    <th className="py-3.5">Featured</th>
                    <th className="py-3.5">Status</th>
                    <th className="py-3.5 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-cream-50/50 transition-colors">
                      {/* Snack Details */}
                      <td className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl bg-cream-100 overflow-hidden shrink-0 border border-cream-200">
                            <Image
                              src={prod.image_url}
                              alt={prod.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-stone-900 text-sm leading-tight">
                              {prod.name}
                            </div>
                            <div className="text-[10px] text-stone-400 font-medium line-clamp-1 max-w-xs mt-0.5">
                              {prod.description}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 font-semibold text-stone-600">
                        {prod.category?.name || "Uncategorized"}
                      </td>

                      {/* Price */}
                      <td className="py-4 font-black text-stone-900 text-sm">
                        {formatINR(prod.price)}
                      </td>

                      {/* Stock & Quick Adjust Button */}
                      <td className="py-4">
                        <button
                          onClick={() => setAdjustingStockProduct(prod)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all hover:scale-105 shadow-xs ${
                            prod.stock <= 0
                              ? "bg-red-100 text-red-800 border border-red-200"
                              : prod.stock <= 5
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          }`}
                          title="Click to adjust stock"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>{prod.stock} in stock</span>
                        </button>
                      </td>

                      {/* Featured Toggle */}
                      <td className="py-4">
                        <button
                          onClick={() => handleToggleFeatured(prod)}
                          className={`p-1.5 rounded-xl transition-colors ${
                            prod.is_featured
                              ? "bg-amber-100 text-amber-700 font-bold"
                              : "text-stone-300 hover:text-stone-500"
                          }`}
                          title="Toggle Featured on Homepage"
                        >
                          <Flame className={`w-4 h-4 ${prod.is_featured ? "fill-amber-500 text-amber-500" : ""}`} />
                        </button>
                      </td>

                      {/* Active Store Toggle */}
                      <td className="py-4">
                        <button
                          onClick={() => handleToggleActive(prod)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                            prod.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-stone-200 text-stone-600"
                          }`}
                        >
                          {prod.is_active ? "Enabled" : "Disabled"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 text-right pr-6 space-x-1">
                        <button
                          onClick={() => {
                            setEditingProduct(prod);
                            setIsProductModalOpen(true);
                          }}
                          className="p-2 rounded-xl hover:bg-cream-100 text-stone-600 hover:text-brand-orange transition-colors"
                          title="Edit product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          className="p-2 rounded-xl hover:bg-red-50 text-stone-400 hover:text-brand-red transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
          onSaved={(saved) => {
            setProducts((prev) => {
              const idx = prev.findIndex((p) => p.id === saved.id);
              if (idx !== -1) {
                const updated = [...prev];
                updated[idx] = saved;
                return updated;
              }
              return [saved, ...prev];
            });
          }}
        />
      )}

      {/* Stock Adjustment Modal */}
      {adjustingStockProduct && (
        <StockAdjustModal
          product={adjustingStockProduct}
          onClose={() => setAdjustingStockProduct(null)}
          onStockUpdated={(updated) => {
            setProducts((prev) =>
              prev.map((p) => (p.id === updated.id ? updated : p))
            );
          }}
        />
      )}
    </div>
  );
}

