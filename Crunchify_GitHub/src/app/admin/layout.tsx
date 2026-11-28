"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import {
  Loader2,
  LayoutDashboard,
  ClipboardList,
  Package,
  Layers,
  Settings,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdminAuthenticated, authChecking, pendingOrdersCount } = useStore();
  const [checking, setChecking] = useState(true);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (authChecking) return;
    // If not authenticated and not on login page, redirect to login
    if (!isAdminAuthenticated && !isLoginPage) {
      router.push("/admin/login");
    } else {
      setChecking(false);
    }
  }, [authChecking, isAdminAuthenticated, isLoginPage, router]);

  if (isLoginPage) {
    return <div className="min-h-screen bg-cream-50">{children}</div>;
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  const navLinks = [
    { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
    {
      label: "Orders",
      href: "/admin/orders",
      icon: <ClipboardList className="w-5 h-5" />,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
    },
    { label: "Products", href: "/admin/products", icon: <Package className="w-5 h-5" /> },
    { label: "Stock", href: "/admin/inventory", icon: <Layers className="w-5 h-5" /> },
    { label: "Settings", href: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-cream-50 text-stone-900 pb-16 md:pb-0">
      {/* Desktop Sidebar (hidden on md-) */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        <AdminHeader />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (md:hidden) — strictly fixed */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-brand-border px-2 py-1.5 flex items-center justify-around shadow-elevated">
        {navLinks.map((link) => {
          const isActive =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname?.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all ${
                isActive
                  ? "text-brand-orange"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <div className="relative">
                {link.icon}
                {link.badge && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-brand-red text-white text-[9px] font-black flex items-center justify-center animate-bounce">
                    {link.badge}
                  </span>
                )}
              </div>
              <span className="mt-0.5">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
