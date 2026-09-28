import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { KnowledgeItem, KnowledgeStatus, Promotion } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value?: string) {
  if (!value) return "Tanpa batas";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function formatRupiah(value?: number) {
  if (!value) return "Tidak ada minimum";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function localDate(offsetDays = 0) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function knowledgeStatus(item: KnowledgeItem, today = localDate()): KnowledgeStatus {
  if (item.status === "archived") return "archived";
  if (item.activeVersionId) return item.expiryDate && item.expiryDate < today ? "expired" : "active";
  return item.status;
}

export function promotionStatus(promo: Promotion, today = localDate()): Promotion["status"] {
  if (promo.periodEnd < today) return "expired";
  if (promo.status === "archived") return "archived";
  if (promo.periodStart > today) return "archived";
  const deadline = new Date(`${today}T12:00:00`);
  deadline.setDate(deadline.getDate() + 5);
  const nearDate = `${deadline.getFullYear()}-${String(deadline.getMonth() + 1).padStart(2, "0")}-${String(deadline.getDate()).padStart(2, "0")}`;
  return promo.periodEnd <= nearDate ? "ending_soon" : "active";
}
