import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as Indian Rupees */
export function formatINR(amount: number): string {
  return '₹' + Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Format number in Indian locale without currency symbol */
export function formatNumber(n: number, decimals = 0): string {
  return Number(n || 0).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Slugify a string */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Escape HTML to prevent XSS */
export function escapeHtml(str: string): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Get brand color class based on brand name */
export function getBrandColor(brand: string): string {
  if (brand.includes('Berger')) return 'from-red-800 to-red-950';
  if (brand.includes('Asian')) return 'from-amber-600 to-amber-900';
  if (brand.includes('Birla')) return 'from-blue-600 to-blue-900';
  return 'from-gray-600 to-gray-900';
}

/** Get brand bg class */
export function getBrandBg(brand: string): string {
  if (!brand) return 'brand-berger';
  if (brand.includes('Berger')) return 'brand-berger';
  if (brand.includes('Asian')) return 'brand-asian';
  if (brand.includes('Birla')) return 'brand-birla';
  return 'brand-berger';
}

/** Parse date to YYYY-MM-DD string */
export function toDateString(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/** Add days to a date */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Validate Indian phone number */
export function isValidPhone(phone: string): boolean {
  const cleaned = (phone || '').trim().replace(/^(\+91|91)[\s-]*/, '').replace(/[\s-]/g, '');
  return /^[6-9]\d{9}$/.test(cleaned);
}

/** Validate email */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Safe positive number parse */
export function safeNum(val: unknown, fallback = 0): number {
  const n = Number(val);
  return isNaN(n) ? fallback : n;
}

/** Clamp a value between min and max */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

/** Generate a unique ID */
export function uid(): string {
  return 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/** Truncate string */
export function truncate(str: string, len = 40): string {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

/** Format date for display */
export function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
