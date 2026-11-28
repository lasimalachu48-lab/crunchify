export interface UpiLinkOptions {
  upiId: string;
  payeeName: string;
  amount: number;
  orderReference: string;
  notes?: string;
}

/**
 * Builds standard NPCI UPI Deep Link
 * Example: upi://pay?pa=7736190495@ptsbi&pn=CRUNCHIFY%20SNACKS&am=120.00&cu=INR&tn=CRUNCH-X91A
 */
export function generateUpiLink(options: UpiLinkOptions): string {
  const { upiId, payeeName, amount, orderReference, notes } = options;
  const transactionNote = notes ? `${orderReference} - ${notes}` : `Order ${orderReference}`;

  const params = new URLSearchParams({
    pa: upiId.trim(),
    pn: payeeName.trim(),
    am: amount.toFixed(2),
    cu: "INR",
    tn: transactionNote.slice(0, 50),
    tr: orderReference,
  });

  return `upi://pay?${params.toString()}`;
}

/**
 * Validates UPI Transaction Reference / UTR
 * In India, banking UTRs are typically 12 digits (numeric), but some gateways or wallets return 12-16 characters.
 */
export function validateUtr(utr: string): { isValid: boolean; message?: string } {
  const cleaned = utr.trim();
  if (!cleaned) {
    return { isValid: false, message: "UPI Reference / UTR cannot be empty." };
  }
  if (cleaned.length < 6) {
    return { isValid: false, message: "Reference must be at least 6 characters (usually 12 digits)." };
  }
  return { isValid: true };
}

