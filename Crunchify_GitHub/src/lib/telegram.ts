/**
 * Server-side Telegram Bot Notification Service.
 * Dispatches alerts directly to Telegram channel or admin chat without exposing secrets.
 */

export interface TelegramOrderNotification {
  orderReference: string;
  customerName: string;
  phoneNumber: string;
  pickupLocation: string;
  totalAmount: number;
  itemsSummary: string;
  upiReference?: string | null;
  notes?: string | null;
}

function escapeTelegramHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendTelegramNotification(
  type: 'NEW_ORDER' | 'PAYMENT_SUBMITTED' | 'ORDER_READY',
  data: TelegramOrderNotification
): Promise<{ success: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    // Graceful no-op if Telegram integration not yet configured by admin
    return {
      success: false,
      error: 'TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured in environment variables.',
    };
  }

  const safeRef = escapeTelegramHtml(data.orderReference);
  const safeName = escapeTelegramHtml(data.customerName);
  const safePhone = escapeTelegramHtml(data.phoneNumber);
  const safePickup = escapeTelegramHtml(data.pickupLocation);
  const safeNotes = data.notes ? escapeTelegramHtml(data.notes) : "";
  const safeUtr = data.upiReference ? escapeTelegramHtml(data.upiReference) : "";
  const safeItems = escapeTelegramHtml(data.itemsSummary);

  let text = '';

  if (type === 'NEW_ORDER') {
    text = `🚨 <b>NEW CRUNCHIFY ORDER!</b>\n\n` +
      `🧾 <b>Ref:</b> <code>${safeRef}</code>\n` +
      `👤 <b>Customer:</b> ${safeName}\n` +
      `📱 <b>Phone:</b> ${safePhone}\n` +
      `📍 <b>Pickup Room:</b> <b>${safePickup}</b>\n` +
      `💰 <b>Amount:</b> ₹${data.totalAmount.toFixed(2)}\n\n` +
      `🛒 <b>Items:</b>\n${safeItems}\n` +
      (safeNotes ? `📝 <b>Notes:</b> <i>${safeNotes}</i>\n` : '') +
      `\n<i>Status: Awaiting UPI Payment Verification</i>`;
  } else if (type === 'PAYMENT_SUBMITTED') {
    text = `💳 <b>PAYMENT UTR SUBMITTED!</b>\n\n` +
      `🧾 <b>Ref:</b> <code>${safeRef}</code>\n` +
      `👤 <b>Customer:</b> ${safeName}\n` +
      `📍 <b>Room:</b> ${safePickup}\n` +
      `💰 <b>Amount:</b> ₹${data.totalAmount.toFixed(2)}\n` +
      `🔢 <b>UTR / Ref:</b> <code>${safeUtr || 'N/A'}</code>\n\n` +
      `👉 <i>Open Admin Dashboard to verify and accept!</i>`;
  } else if (type === 'ORDER_READY') {
    text = `🎉 <b>ORDER READY FOR PICKUP!</b>\n\n` +
      `🧾 <b>Ref:</b> <code>${safeRef}</code>\n` +
      `👤 <b>Customer:</b> ${safeName}\n` +
      `📍 <b>Pickup Point:</b> ${safePickup}`;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('[Telegram Notify Error]', errBody);
      return { success: false, error: errBody };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Telegram Notify Exception]', message);
    return { success: false, error: message };
  }
}
