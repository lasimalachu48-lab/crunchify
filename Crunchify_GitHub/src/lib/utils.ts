import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { OrderStatus, PaymentStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(d);
  } catch {
    return dateString;
  }
}

export function generateOrderReference(): string {
  const timestamp = Date.now().toString().slice(-4);
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CRUNCH-${randomChars}${timestamp}`;
}

export function getStatusDetails(status: OrderStatus): {
  label: string;
  badgeBg: string;
  badgeText: string;
  dotColor: string;
  step: number;
  description: string;
} {
  switch (status) {
    case 'pending_payment':
      return {
        label: 'Pending Payment',
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-800 border-amber-300',
        dotColor: 'bg-amber-500',
        step: 1,
        description: 'Waiting for UPI payment verification submit.'
      };
    case 'payment_under_verification':
      return {
        label: 'Verifying Payment',
        badgeBg: 'bg-blue-100',
        badgeText: 'text-blue-800 border-blue-300',
        dotColor: 'bg-blue-500',
        step: 2,
        description: 'Owner is cross-checking your UPI reference.'
      };
    case 'confirmed':
      return {
        label: 'Order Confirmed',
        badgeBg: 'bg-emerald-100',
        badgeText: 'text-emerald-800 border-emerald-300',
        dotColor: 'bg-emerald-500',
        step: 3,
        description: 'Payment verified! Order accepted by kitchen.'
      };
    case 'preparing':
      return {
        label: 'Packing Munchies',
        badgeBg: 'bg-orange-100',
        badgeText: 'text-orange-800 border-orange-300',
        dotColor: 'bg-orange-500',
        step: 4,
        description: 'Snacks are being bagged and chilled drinks pulled.'
      };
    case 'ready_for_pickup':
      return {
        label: 'Ready for Pickup!',
        badgeBg: 'bg-green-100',
        badgeText: 'text-green-800 border-green-300 animate-pulse',
        dotColor: 'bg-green-500',
        step: 5,
        description: 'Your snacks are ready! Head over to the room now.'
      };
    case 'collected':
      return {
        label: 'Collected',
        badgeBg: 'bg-stone-200',
        badgeText: 'text-stone-800 border-stone-300',
        dotColor: 'bg-stone-500',
        step: 6,
        description: 'Snacks handed over. Enjoy your cravings!'
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        badgeBg: 'bg-red-100',
        badgeText: 'text-red-800 border-red-300',
        dotColor: 'bg-red-500',
        step: 0,
        description: 'Order was cancelled or payment verification failed.'
      };
    default:
      return {
        label: status,
        badgeBg: 'bg-stone-100',
        badgeText: 'text-stone-800 border-stone-200',
        dotColor: 'bg-stone-400',
        step: 0,
        description: ''
      };
  }
}

export function getPaymentStatusDetails(status: PaymentStatus): {
  label: string;
  color: string;
} {
  switch (status) {
    case 'unpaid':
      return { label: 'Unpaid', color: 'text-stone-600 bg-stone-100' };
    case 'under_verification':
      return { label: 'In Review', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    case 'paid':
      return { label: 'Paid & Verified', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    case 'rejected':
      return { label: 'Payment Rejected', color: 'text-red-700 bg-red-50 border-red-200' };
  }
}

