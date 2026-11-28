"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/context/StoreContext";
import { useRouter } from "next/navigation";
import {
  Bell,
  Volume2,
  VolumeX,
  LogOut,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check,
} from "lucide-react";
import Link from "next/link";

export function AdminHeader() {
  const router = useRouter();
  const {
    settings,
    logoutAdmin,
    pendingOrdersCount,
    resetPendingCount,
    triggerNewOrderSound,
  } = useStore();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestBrowserPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === "granted") {
        new Notification("CRUNCHIFY Admin Notifications Active", {
          body: "You will receive real-time alerts when new snack orders arrive!",
          icon: "/favicon.ico",
        });
      }
    }
  };

  const handleTestChime = () => {
    triggerNewOrderSound();
  };

  const handleLogout = () => {
    logoutAdmin();
    router.push("/admin/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-brand-border px-3.5 sm:px-6 py-2.5 sm:py-3.5">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Title or Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <h1 className="font-extrabold text-stone-900 text-xs sm:text-base truncate">
              CRUNCHIFY Control Room
            </h1>
          </div>
          <span className="hidden sm:inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-cream-100 text-stone-600 shrink-0">
            Admin Mode
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Browser Notification Permission Button */}
          {notificationPermission !== "granted" && (
            <button
              onClick={requestBrowserPermission}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-brand-orange hover:bg-orange-100 text-xs font-bold transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Enable Browser Alerts</span>
            </button>
          )}

          {/* Sound Effect Test Toggle */}
          <button
            onClick={handleTestChime}
            title="Test order sound chime"
            className="p-1.5 sm:p-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-stone-700 transition-colors flex items-center gap-1.5 text-xs font-bold min-h-[34px] min-w-[34px] justify-center"
          >
            <Volume2 className="w-4 h-4 text-brand-orange" />
            <span className="hidden lg:inline">Test Chime</span>
          </button>

          {/* Order Alert Badge */}
          <Link
            href="/admin/orders?status=pending"
            onClick={resetPendingCount}
            className="relative p-1.5 sm:p-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-stone-700 transition-colors min-h-[34px] min-w-[34px] flex items-center justify-center"
            title="Pending Orders"
          >
            <Bell className="w-4 h-4" />
            {pendingOrdersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-brand-red text-white text-[9px] sm:text-[10px] font-black flex items-center justify-center animate-bounce shadow-sm">
                {pendingOrdersCount}
              </span>
            )}
          </Link>

          {/* View Live Store */}
          <Link
            href="/"
            target="_blank"
            className="hidden xs:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-xs font-bold text-stone-700 transition-colors"
          >
            <span>Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-1.5 sm:p-2 rounded-xl hover:bg-red-50 text-stone-500 hover:text-brand-red transition-colors min-h-[34px] min-w-[34px] flex items-center justify-center"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

