"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Category, Order, StoreSettings } from "@/types";
import { INITIAL_CATEGORIES, INITIAL_STORE_SETTINGS } from "@/lib/db/seed-data";
import { playChime } from "@/lib/audio";

interface StoreContextType {
  settings: StoreSettings;
  categories: Category[];
  refreshSettings: () => Promise<void>;
  isAdminAuthenticated: boolean;
  authChecking: boolean;
  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAdminWithGoogle: (googleEmail?: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => void;
  pendingOrdersCount: number;
  incrementPendingCount: () => void;
  resetPendingCount: () => void;
  triggerNewOrderSound: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_STORE_SETTINGS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);

  // Check admin auth state on mount and verify session with server
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = localStorage.getItem("crunchify_admin_session");
        const token = localStorage.getItem("crunchify_admin_token");
        if (auth === "true") {
          const res = await fetch("/api/admin/auth", {
            cache: "no-store",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (res.ok) {
            setIsAdminAuthenticated(true);
          } else {
            localStorage.removeItem("crunchify_admin_session");
            localStorage.removeItem("crunchify_admin_token");
            setIsAdminAuthenticated(false);
          }
        }
      } catch {
        // ignore
      } finally {
        setAuthChecking(false);
      }
    };
    checkAuth();
  }, []);

  const refreshSettings = async () => {
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
        if (data.categories) setCategories(data.categories);
      }
    } catch (e) {
      console.warn("Could not fetch remote settings, using current:", e);
    }
  };

  useEffect(() => {
    refreshSettings();
    const onFocus = () => refreshSettings();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const loginAdmin = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAdminAuthenticated(true);
        localStorage.setItem("crunchify_admin_session", "true");
        localStorage.setItem("crunchify_admin_token", data.token || "");
        localStorage.setItem("crunchify_admin_email", data.email || email);
        return { success: true };
      }
      return { success: false, error: data.error || "Authentication failed" };
    } catch {
      return { success: false, error: "Network error during authentication" };
    }
  };

  const loginAdminWithGoogle = async (
    googleEmail?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "google",
          googleUser: { email: googleEmail },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAdminAuthenticated(true);
        localStorage.setItem("crunchify_admin_session", "true");
        localStorage.setItem("crunchify_admin_token", data.token || "");
        localStorage.setItem("crunchify_admin_email", googleEmail || "");
        return { success: true };
      }
      return {
        success: false,
        error:
          data.error ||
          "Google Sign-In is not configured for production. Please use your Admin Password to log in.",
      };
    } catch {
      return { success: false, error: "Network error with Google authentication" };
    }
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    try {
      localStorage.removeItem("crunchify_admin_session");
      localStorage.removeItem("crunchify_admin_token");
      localStorage.removeItem("crunchify_admin_email");
      fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      }).catch(() => {});
    } catch {
      // ignore
    }
  };

  const triggerNewOrderSound = () => {
    playChime("new_order");
  };

  const incrementPendingCount = () => {
    setPendingOrdersCount((c) => c + 1);
    triggerNewOrderSound();
  };

  const resetPendingCount = () => {
    setPendingOrdersCount(0);
  };

  return (
    <StoreContext.Provider
      value={{
        settings,
        categories,
        refreshSettings,
        isAdminAuthenticated,
        authChecking,
        loginAdmin,
        loginAdminWithGoogle,
        logoutAdmin,
        pendingOrdersCount,
        incrementPendingCount,
        resetPendingCount,
        triggerNewOrderSound,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
