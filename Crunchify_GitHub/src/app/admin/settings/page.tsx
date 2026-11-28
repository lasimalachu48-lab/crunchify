"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/context/StoreContext";
import { StoreSettings } from "@/types";
import {
  Settings,
  Save,
  Check,
  AlertCircle,
  QrCode,
  MapPin,
  Clock,
  Phone,
  Flame,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  UploadCloud,
} from "lucide-react";

export default function AdminSettingsPage() {
  const { settings, refreshSettings } = useStore();

  const [formData, setFormData] = useState<StoreSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [uploadingHeroImg, setUploadingHeroImg] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (
    field: keyof StoreSettings,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setUploadingHeroImg(true);
    try {
      const uploadForm = new FormData();
      uploadForm.append("file", file);
      uploadForm.append("folder", "hero");

      const token = localStorage.getItem("crunchify_admin_token");
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: uploadForm,
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.url) {
        setErrorMsg(data.error || "Failed to upload splash image.");
        return;
      }
      handleChange("hero_image_url", data.url);
    } catch {
      setErrorMsg("Network error uploading splash image.");
    } finally {
      setUploadingHeroImg(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      setSaving(true);
      const token = localStorage.getItem("crunchify_admin_token");
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Failed to update store settings.");
        setSaving(false);
        return;
      }

      await refreshSettings();
      setSuccessMsg("Store settings updated and synchronized with database!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setErrorMsg("Network error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Store Settings & UPI Configuration
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Configure business details, UPI payment ID, pickup counter instructions and promotional banners
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Section 1: Business Identity */}
        <div className="bg-white rounded-3xl sm:rounded-4xl p-4 sm:p-8 border border-cream-200 shadow-card space-y-4">
          <h2 className="text-base font-bold text-stone-900 border-b border-cream-100 pb-3 flex items-center gap-2">
            <Flame className="w-4 h-4 text-brand-orange" />
            <span>Brand Identity &amp; Tagline</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Store Name
              </label>
              <input
                type="text"
                required
                value={formData.store_name}
                onChange={(e) => handleChange("store_name", e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-cream-50 border border-cream-200 text-base sm:text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Brand Tagline
              </label>
              <input
                type="text"
                required
                value={formData.tagline}
                onChange={(e) => handleChange("tagline", e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-cream-50 border border-cream-200 text-base sm:text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 min-h-[44px]"
              />
            </div>
          </div>
        </div>

        {/* Section 1B: Home Splash Screen Image & Message */}
        <div className="bg-white rounded-3xl sm:rounded-4xl p-4 sm:p-8 border border-cream-200 shadow-card space-y-4">
          <h2 className="text-base font-bold text-stone-900 border-b border-cream-100 pb-3 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-brand-orange" />
            <span>Home Splash Screen Image &amp; Message</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            <div className="md:col-span-8 space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Splash / Hero Image URL
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={formData.hero_image_url || ""}
                    onChange={(e) => handleChange("hero_image_url", e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-cream-50 border border-cream-200 text-base sm:text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 min-h-[44px]"
                  />
                  <label className="px-4 py-2.5 rounded-2xl bg-cream-100 hover:bg-cream-200 border border-cream-300 text-stone-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors min-h-[44px] shrink-0">
                    {uploadingHeroImg ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-brand-orange" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4 text-brand-orange" />
                        <span>Upload Image</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleHeroImageUpload}
                      disabled={uploadingHeroImg}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Message Near Splash Image (Home Hero Description)
                </label>
                <textarea
                  rows={2}
                  value={formData.hero_description || ""}
                  onChange={(e) => handleChange("hero_description", e.target.value)}
                  placeholder="Order hot Maggi, crispy Doritos, icy cold drinks, and sweet chocolates..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-cream-50 border border-cream-200 text-base sm:text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
                />
              </div>
            </div>

            <div className="md:col-span-4">
              <span className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Preview
              </span>
              <div className="relative aspect-square w-full max-w-[180px] rounded-2xl overflow-hidden border border-cream-200 bg-cream-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    formData.hero_image_url ||
                    "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=1000&q=80"
                  }
                  alt="Splash preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <span className="px-1.5 py-0.5 rounded-full bg-brand-orange text-[8px] font-black uppercase">
                    {formData.hero_badge_text || "Fresh Restock"}
                  </span>
                  <p className="text-[11px] font-bold truncate mt-0.5">
                    {formData.hero_card_title || "Doritos & Chilled Sodas"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Image Badge Text
              </label>
              <input
                type="text"
                value={formData.hero_badge_text || ""}
                onChange={(e) => handleChange("hero_badge_text", e.target.value)}
                placeholder="Fresh Restock"
                className="w-full px-4 py-2.5 rounded-2xl bg-cream-50 border border-cream-200 text-base sm:text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Image Card Title
              </label>
              <input
                type="text"
                value={formData.hero_card_title || ""}
                onChange={(e) => handleChange("hero_card_title", e.target.value)}
                placeholder="Doritos & Chilled Sodas"
                className="w-full px-4 py-2.5 rounded-2xl bg-cream-50 border border-cream-200 text-base sm:text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Image Card Subtitle
              </label>
              <input
                type="text"
                value={formData.hero_card_subtitle || ""}
                onChange={(e) => handleChange("hero_card_subtitle", e.target.value)}
                placeholder="Ready in the cooler right now"
                className="w-full px-4 py-2.5 rounded-2xl bg-cream-50 border border-cream-200 text-base sm:text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 min-h-[44px]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: UPI Configuration (Critical Requirement) */}
        <div className="bg-white rounded-3xl sm:rounded-4xl p-4 sm:p-8 border-2 border-brand-orange/30 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-cream-100 pb-3">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-brand-orange" />
              <span>UPI Payment Configuration</span>
            </h2>
            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-orange-100 text-brand-orange">
              Live Gateway Target
            </span>
          </div>

          <p className="text-xs text-stone-500">
            This UPI ID receives all customer QR code payments and mobile app transfers. Orders will generate deep links and QR codes targeting this address.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Merchant UPI ID *
              </label>
              <input
                type="text"
                required
                value={formData.upi_id}
                onChange={(e) => handleChange("upi_id", e.target.value)}
                placeholder="7736190495@ptsbi"
                className="w-full px-4 py-2.5 rounded-2xl bg-cream-50 border border-cream-200 font-mono text-base sm:text-sm font-black text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Payee Display Name *
              </label>
              <input
                type="text"
                required
                value={formData.payee_name}
                onChange={(e) => handleChange("payee_name", e.target.value)}
                placeholder="CRUNCHIFY SNACKS"
                className="w-full px-4 py-2.5 rounded-2xl bg-cream-50 border border-cream-200 text-base sm:text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 min-h-[44px]"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">
                Displayed in the customer&apos;s UPI app (Google Pay, PhonePe, Paytm).
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Physical Pickup Instructions */}
        <div className="bg-white rounded-3xl sm:rounded-4xl p-4 sm:p-8 border border-cream-200 shadow-card space-y-4">
          <h2 className="text-base font-bold text-stone-900 border-b border-cream-100 pb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Pickup Location &amp; Operating Hours</span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Pickup Instructions (Displayed to customers on Checkout &amp; Tracking)
            </label>
            <textarea
              rows={2}
              required
              value={formData.pickup_instructions}
              onChange={(e) => handleChange("pickup_instructions", e.target.value)}
              placeholder="e.g. Room 1246, B Block - Knock twice or call for immediate handoff!"
              className="w-full px-4 py-2.5 rounded-2xl bg-cream-50 border border-cream-200 text-base sm:text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Owner Contact Number
              </label>
              <input
                type="text"
                required
                value={formData.contact_number}
                onChange={(e) => handleChange("contact_number", e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-cream-50 border border-cream-200 text-base sm:text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Operating Hours
              </label>
              <input
                type="text"
                required
                value={formData.opening_hours}
                onChange={(e) => handleChange("opening_hours", e.target.value)}
                placeholder="5:00 PM – 2:30 AM Daily"
                className="w-full px-4 py-2.5 rounded-2xl bg-cream-50 border border-cream-200 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Banner & Thresholds */}
        <div className="bg-white rounded-4xl p-6 sm:p-8 border border-cream-200 shadow-card space-y-4">
          <h2 className="text-base font-bold text-stone-900 border-b border-cream-100 pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Store Banner & Order Thresholds</span>
          </h2>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Top Promotional Banner Text
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-brand-orange cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.banner_active}
                  onChange={(e) => handleChange("banner_active", e.target.checked)}
                  className="w-4 h-4 rounded text-brand-orange focus:ring-brand-orange accent-brand-orange"
                />
                <span>Banner Active</span>
              </label>
            </div>
            <input
              type="text"
              value={formData.banner_text}
              onChange={(e) => handleChange("banner_text", e.target.value)}
              placeholder="e.g. 🔥 Midnight Munchies Alert: Fresh stock loaded!"
              className="w-full px-4 py-2.5 rounded-2xl bg-cream-50 border border-cream-200 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Minimum Order Amount (INR ₹)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={formData.min_order_amount}
                onChange={(e) =>
                  handleChange("min_order_amount", parseFloat(e.target.value) || 0)
                }
                className="w-full px-4 py-2.5 rounded-2xl bg-cream-50 border border-cream-200 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Low Stock Warning Threshold (Units)
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.low_stock_threshold}
                onChange={(e) =>
                  handleChange("low_stock_threshold", parseInt(e.target.value, 10) || 1)
                }
                className="w-full px-4 py-2.5 rounded-2xl bg-cream-50 border border-cream-200 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>
          </div>
        </div>

        {/* Save Changes Floating Action Bar */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-4 rounded-2xl bg-brand-orange hover:bg-brand-orange-dark text-white font-black text-xs shadow-snack flex items-center gap-2 active:scale-95 transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving to Database...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Store Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

