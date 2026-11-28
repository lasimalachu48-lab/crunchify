"use client";

import React from "react";
import { OrderStatus } from "@/types";
import { getStatusDetails } from "@/lib/utils";
import { Clock, ShieldCheck, CheckCircle2, PackageCheck, PartyPopper, Check, XCircle } from "lucide-react";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const details = getStatusDetails(status);

  const getIcon = () => {
    switch (status) {
      case "pending_payment":
        return <Clock className="w-3.5 h-3.5" />;
      case "payment_under_verification":
        return <ShieldCheck className="w-3.5 h-3.5 animate-pulse" />;
      case "confirmed":
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case "preparing":
        return <PackageCheck className="w-3.5 h-3.5 text-orange-600" />;
      case "ready_for_pickup":
        return <PartyPopper className="w-3.5 h-3.5 text-green-700 animate-bounce" />;
      case "collected":
        return <Check className="w-3.5 h-3.5" />;
      case "cancelled":
        return <XCircle className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${details.badgeBg} ${details.badgeText}`}
    >
      {getIcon()}
      <span>{details.label}</span>
    </span>
  );
}

