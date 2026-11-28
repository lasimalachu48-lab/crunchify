"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Product, Category } from "@/types";
import { X, UploadCloud, Loader2, Check } from "lucide-react";

interface ProductFormModalProps {
  product: Product | null; // null means adding a new product
  categories: Category[];
  onClose: () => void;
  onSaved: (product: Product) => void;
}

export function ProductFormModal({
  product,
  categories,
  onClose,
  onSaved,
}: ProductFormModalProps) {
  const isEditing = Boolean(product);

  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product?.price?.toString() || "");
  const [stock, setStock] = useState(product?.stock?.toString() || "");
  const [categoryId, setCategoryId] = useState(
    product?.category_id || categories[0]?.id || "c1000000-0000-0000-0000-000000000001"
  );
  const [imageUrl, setImageUrl] = useState(
    product?.image_url ||
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80"
  );
  const [isFeatured, setIsFeatured] = useState(product?.is_featured || false);
  const [isActive, setIsActive] = useState(product?.is_active !== undefined ? product.is_active : true);
  const [tagsStr, setTagsStr] = useState(product?.tags?.join(", ") || "");

  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        setUploadingImage(true);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "products");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          setImageUrl(data.url);
        }
      } catch (err) {
        console.error("Upload failed:", err);
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !price || !stock) {
      setErrorMsg("Please fill in the product name, price and stock.");
      return;
    }

    try {
      setSaving(true);
      const tags = tagsStr
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const payload = {
        id: product?.id,
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        category_id: categoryId,
        image_url: imageUrl,
        is_featured: isFeatured,
        is_active: isActive,
        tags,
      };

      const res = await fetch("/api/products", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Failed to save product.");
        setSaving(false);
        return;
      }

      onSaved(data.product);
      onClose();
    } catch (err) {
      setErrorMsg("Network error saving product.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3.5 sm:p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-[#35251D]/60 backdrop-blur-xs" />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-white rounded-4xl border border-cream-200 shadow-2xl z-10 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-cream-200 flex items-center justify-between bg-cream-50">
          <div>
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              {isEditing ? "Edit Product" : "New Snack Item"}
            </span>
            <h2 className="text-xl font-black text-stone-900">
              {isEditing ? product?.name : "Add Munchies to Catalogue"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-cream-200 text-stone-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Product Title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lay's Magic Masala (50g)"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-cream-50 border border-cream-200 text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
            />
          </div>

          {/* Category & Price Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-cream-50 border border-cream-200 text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.slug === "combos" ? "★ (Combos & Offers Page)" : ""}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-stone-400 mt-1 block">
                Selecting &quot;Midnight Combos&quot; displays this item on the /combos page.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Price (INR ₹) *
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="20"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-cream-50 border border-cream-200 text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>
          </div>

          {/* Stock & Tags Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Available Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="24"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-cream-50 border border-cream-200 text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                placeholder="Bestseller, Spicy, Crunchy"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-cream-50 border border-cream-200 text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Short Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Crisp potato slices tossed in signature Indian spice mix."
              className="w-full px-3.5 py-2 rounded-2xl bg-cream-50 border border-cream-200 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
            />
          </div>

          {/* Image URL & Upload */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Image URL / Photo
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3.5 py-2 rounded-2xl bg-cream-50 border border-cream-200 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
              />
              <label className="px-3 py-2 rounded-2xl bg-cream-100 hover:bg-cream-200 border border-cream-200 text-xs font-bold text-stone-700 cursor-pointer flex items-center gap-1.5 transition-colors">
                <UploadCloud className="w-4 h-4 text-brand-orange" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {uploadingImage && (
              <span className="text-[11px] text-brand-orange font-bold mt-1 block">
                Uploading photo...
              </span>
            )}

            {imageUrl && (
              <div className="mt-2 relative w-20 h-20 rounded-xl overflow-hidden border border-cream-200 bg-cream-100">
                <Image src={imageUrl} alt="Preview" fill className="object-cover" />
              </div>
            )}
          </div>

          {/* Toggles */}
          <div className="pt-2 border-t border-cream-100 flex flex-wrap gap-6 text-xs font-bold text-stone-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-brand-orange focus:ring-brand-orange accent-brand-orange"
              />
              <span>Feature on Homepage</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-brand-orange focus:ring-brand-orange accent-brand-orange"
              />
              <span>Active in Store</span>
            </label>
          </div>

          {/* Footer Save Button */}
          <div className="pt-4 border-t border-cream-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-cream-100 hover:bg-cream-200 text-stone-700 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-2xl bg-brand-orange hover:bg-brand-orange-dark text-white font-bold text-xs shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? "Save Changes" : "Create Product"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
