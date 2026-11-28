"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CrunchifyLogo } from "@/components/ui/CrunchifyLogo";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Settings,
  Flame,
  ArrowUpRight,
  ClipboardList,
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Orders", href: "/admin/orders", icon: <ClipboardList className="w-4 h-4" /> },
    { label: "Products", href: "/admin/products", icon: <Package className="w-4 h-4" /> },
    { label: "Inventory & Stock", href: "/admin/inventory", icon: <Layers className="w-4 h-4" /> },
    { label: "Store Settings", href: "/admin/settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-white border-r border-brand-border hidden md:flex flex-col justify-between shrink-0 h-screen fixed top-0 left-0 z-30 overflow-y-auto no-scrollbar">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-cream-200">
          <Link href="/">
            <CrunchifyLogo size="sm" withTagline={false} />
            <span className="text-[10px] uppercase font-bold text-brand-orange tracking-widest block mt-1 ml-1">
              Owner Control Room
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5">
          {links.map((link) => {
            const isActive =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname?.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-brand-orange text-white shadow-snack"
                    : "text-stone-600 hover:text-stone-900 hover:bg-cream-100"
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer link to public store */}
      <div className="p-4 border-t border-cream-200">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between p-3 rounded-2xl bg-cream-50 hover:bg-cream-100 border border-cream-200 text-xs font-bold text-stone-700 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-brand-orange" />
            <span>Go to Customer Store</span>
          </div>
          <ArrowUpRight className="w-4 h-4 text-stone-400" />
        </Link>
      </div>
    </aside>
  );
}

