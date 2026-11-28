"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { generateUpiLink } from "@/lib/upi";
import { formatINR } from "@/lib/utils";
import { Copy, Check, ExternalLink, ShieldCheck, Smartphone, Zap } from "lucide-react";

interface UpiQrCodeProps {
  upiId: string;
  payeeName: string;
  amount: number;
  orderReference: string;
}

export function UpiQrCode({
  upiId,
  payeeName,
  amount,
  orderReference,
}: UpiQrCodeProps) {
  const [copied, setCopied] = useState(false);

  const upiLink = generateUpiLink({
    upiId,
    payeeName,
    amount,
    orderReference,
  });

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-8 border border-cream-200 shadow-card flex flex-col items-center text-center">
      <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-brand-orange text-[11px] sm:text-xs font-semibold mb-3 sm:mb-4 max-w-full">
        <Zap className="w-3.5 h-3.5 fill-brand-orange shrink-0" />
        <span className="truncate">Zero Gateway Fees • Direct UPI Transfer</span>
      </div>

      <div className="mb-1 sm:mb-2">
        <span className="text-[11px] sm:text-xs font-semibold text-stone-500 uppercase tracking-wider">
          Total Amount to Pay
        </span>
        <div className="text-3xl sm:text-4xl font-extrabold text-brand-dark tracking-tight mt-0.5 sm:mt-1">
          {formatINR(amount)}
        </div>
      </div>

      {/* QR Code Container with nice framing */}
      <div className="relative p-3 sm:p-4 bg-gradient-to-b from-cream-50 to-white rounded-2xl border-2 border-brand-orange/30 shadow-inner my-3 sm:my-4 max-w-full">
        <div className="w-[180px] h-[180px] sm:w-[210px] sm:h-[210px] flex items-center justify-center">
          <QRCodeSVG
            value={upiLink}
            size={180}
            className="w-full h-full"
            level="H"
            includeMargin={false}
            imageSettings={{
              src: "/favicon.ico",
              x: undefined,
              y: undefined,
              height: 26,
              width: 26,
              excavate: true,
            }}
          />
        </div>
        <div className="mt-2.5 sm:mt-3 flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-brand-dark/70 uppercase tracking-wider">
          <Smartphone className="w-3.5 h-3.5 text-brand-orange shrink-0" />
          <span>Scan with any UPI app</span>
        </div>
      </div>

      {/* Supported UPI Apps icons row */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs text-stone-500 mb-4 sm:mb-5 font-medium max-w-xs">
        <span className="px-2 py-0.5 rounded bg-cream-100 text-stone-700 font-semibold text-[10px] sm:text-[11px]">GPay</span>
        <span className="px-2 py-0.5 rounded bg-cream-100 text-stone-700 font-semibold text-[10px] sm:text-[11px]">PhonePe</span>
        <span className="px-2 py-0.5 rounded bg-cream-100 text-stone-700 font-semibold text-[10px] sm:text-[11px]">Paytm</span>
        <span className="px-2 py-0.5 rounded bg-cream-100 text-stone-700 font-semibold text-[10px] sm:text-[11px]">Cred</span>
        <span className="px-2 py-0.5 rounded bg-cream-100 text-stone-700 font-semibold text-[10px] sm:text-[11px]">BHIM</span>
      </div>

      {/* Mobile Deep Link CTA Button */}
      <div className="w-full flex flex-col sm:flex-row gap-2.5 sm:gap-3 mb-4 sm:mb-6">
        <a
          href={upiLink}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl bg-brand-orange hover:bg-brand-orange-dark text-white font-bold text-xs sm:text-sm shadow-md transition-transform active:scale-95 min-h-[44px]"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Pay via Installed UPI App</span>
        </a>
      </div>

      {/* UPI ID Copy Field */}
      <div className="w-full bg-cream-50 border border-cream-200 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2 text-left">
        <div className="truncate min-w-0">
          <p className="text-[9px] sm:text-[10px] uppercase font-bold text-stone-400">Merchant UPI ID</p>
          <p className="font-mono text-xs sm:text-sm font-bold text-stone-800 truncate select-all">{upiId}</p>
        </div>
        <button
          onClick={handleCopyUpi}
          type="button"
          className="shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-cream-100 hover:text-brand-orange transition-colors active:scale-95 shadow-sm min-h-[32px]"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-3 sm:mt-4 flex items-center gap-1.5 text-[11px] sm:text-xs text-stone-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Payee: <strong>{payeeName}</strong></span>
      </div>
    </div>
  );
}

