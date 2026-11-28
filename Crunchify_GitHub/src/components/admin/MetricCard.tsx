"use client";

import React from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  badge?: string;
  badgeColor?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  badge,
  badgeColor = "bg-orange-100 text-brand-orange",
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-cream-200 shadow-card hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
          {title}
        </span>
        <div className="w-10 h-10 rounded-2xl bg-cream-100 flex items-center justify-center text-stone-700">
          {icon}
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          {value}
        </h3>
        {badge && (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 text-xs text-stone-400 font-medium flex items-center gap-1.5">
          {trend && <span className="font-bold text-emerald-600">{trend}</span>}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
}

