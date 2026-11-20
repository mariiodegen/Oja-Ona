// ==============================================================================
// Ọjà Ọnà — Value Formatters
// Note: Inline formatting of currency, dates, and dimensions is prohibited.
// ==============================================================================

import type { OrderStatus, ArtworkStatus } from "@/types/database";

/**
 * Format amounts in Nigerian Naira (₦).
 * Handles both main Naira units and Kobo (where 100 kobo = 1 Naira).
 */
export function formatNgn(amount: number, isKobo = false): string {
  const naira = isKobo ? amount / 100 : amount;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(naira);
}

/**
 * Format amounts in United States Dollars ($).
 */
export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format physical dimensions with multiplication sign (×).
 * e.g., "120 x 90 cm" -> "120 × 90 cm"
 */
export function formatDimensions(dimensions: string): string {
  return dimensions.toLowerCase().replace(/\s*x\s*/g, " × ");
}

/**
 * Format dates into scannable long dates (e.g., "Nov 20, 2026").
 */
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/**
 * Human-readable order status labels and tone-matched badges.
 */
export function formatOrderStatus(status: OrderStatus): { label: string; variant: "warning" | "info" | "success" | "danger" } {
  switch (status) {
    case "paid":
      return { label: "Payment Secured in Escrow", variant: "info" };
    case "shipped":
      return { label: "In Transit / Shipped", variant: "warning" };
    case "delivered":
      return { label: "Delivered & Verified", variant: "success" };
    case "paid_out":
      return { label: "Settled / Paid Out", variant: "success" };
    case "disputed":
      return { label: "Under Dispute Review", variant: "danger" };
    case "refunded":
      return { label: "Refunded to Buyer", variant: "danger" };
  }
}

/**
 * Human-readable artwork status labels.
 */
export function formatArtworkStatus(status: ArtworkStatus): { label: string; isLive: boolean } {
  switch (status) {
    case "draft":
      return { label: "Draft", isLive: false };
    case "live":
      return { label: "Available for Purchase", isLive: true };
    case "sold":
      return { label: "Sold", isLive: false };
  }
}
