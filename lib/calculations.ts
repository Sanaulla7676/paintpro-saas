/**
 * PaintPro Quotation Calculation Engine
 * All monetary values stored in paise (integer), displayed in rupees
 */

import type { Room, QuotationItem, Quotation, QuotationTotals, MeasurementSummary } from '@/types/quotation';
import { safeNum } from '@/lib/utils';

// ─── Room Area ────────────────────────────────────────────────────────────────

export function calcRoomAreas(room: Room) {
  const L = safeNum(room.length_ft);
  const W = safeNum(room.width_ft);
  const H = safeNum(room.height_ft);
  const openings = safeNum(room.openings_sqft);

  // Formula: Wall area = 2 × (L + W) × H
  const wall_area = 2 * (L + W) * H;
  const net_wall_area = Math.max(0, wall_area - openings);
  const ceiling_area = L * W;
  const total_area = net_wall_area + ceiling_area;

  return {
    wall_area_sqft: wall_area,
    net_wall_area_sqft: net_wall_area,
    ceiling_area_sqft: ceiling_area,
    total_area_sqft: total_area,
  };
}

// ─── Measurement Summary ──────────────────────────────────────────────────────

export function calcMeasurementSummary(rooms: Room[]): MeasurementSummary {
  let total_interior_wall = 0;
  let total_exterior_wall = 0;
  let total_ceiling = 0;

  for (const room of rooms) {
    const areas = calcRoomAreas(room);
    if (room.zone === 'Exterior') {
      total_exterior_wall += areas.net_wall_area_sqft;
    } else {
      total_interior_wall += areas.net_wall_area_sqft;
      total_ceiling += areas.ceiling_area_sqft;
    }
  }

  return {
    total_interior_wall,
    total_exterior_wall,
    total_ceiling,
    total_net_area: total_interior_wall + total_exterior_wall + total_ceiling,
    room_count: rooms.length,
  };
}

// ─── Paint Quantity ───────────────────────────────────────────────────────────

/**
 * Required Quantity = Area × Coats ÷ Coverage
 */
export function calcPaintQuantity(
  area: number,
  coats: number,
  coverage: number
): number {
  if (!coverage || coverage <= 0) return 0;
  return (area * coats) / coverage;
}

// ─── Line Item ────────────────────────────────────────────────────────────────

export function calcLineItem(item: QuotationItem, rooms: Room[]): {
  area: number;
  quantity: number;
  amount: number;
} {
  const room = rooms.find((r) => r.name === item.room_name);
  let area = safeNum(item.area_sqft);

  if (!area && room) {
    const areas = calcRoomAreas(room);
    area = item.work_type === 'Ceiling' ? areas.ceiling_area_sqft : areas.net_wall_area_sqft;
  }

  const coats = Math.max(1, safeNum(item.coats, 1));
  const coverage = safeNum(item.coverage);
  const autoQty = coverage > 0 ? calcPaintQuantity(area, coats, coverage) : safeNum(item.quantity, 1);
  const quantity = item.manual_qty ? safeNum(item.quantity, autoQty) : autoQty;
  const rate = safeNum(item.rate);

  return {
    area,
    quantity: quantity || safeNum(item.quantity, 1),
    amount: (quantity || safeNum(item.quantity, 1)) * rate,
  };
}

// ─── Quotation Totals ─────────────────────────────────────────────────────────

export function calcQuotationTotals(quotation: Quotation): QuotationTotals {
  // Sum all line items
  const subtotal = quotation.items.reduce((sum, item) => {
    const { amount } = calcLineItem(item, quotation.rooms);
    return sum + amount;
  }, 0);

  const discount_percent = safeNum(quotation.discount_percent, 0);
  const discount_amount = subtotal * (discount_percent / 100);
  const taxable_amount = Math.max(0, subtotal - discount_amount);

  const gst_percent = safeNum(quotation.gst_percent, 18);
  const gst_amount = taxable_amount * (gst_percent / 100);
  const grand_total = taxable_amount + gst_amount;

  const advance_percent = safeNum(quotation.advance_percent, 0);
  const advance_amount = grand_total * (advance_percent / 100);
  const balance_amount = grand_total - advance_amount;

  // Round to 2 decimal places throughout
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount_amount: Math.round(discount_amount * 100) / 100,
    taxable_amount: Math.round(taxable_amount * 100) / 100,
    gst_amount: Math.round(gst_amount * 100) / 100,
    grand_total: Math.round(grand_total * 100) / 100,
    advance_amount: Math.round(advance_amount * 100) / 100,
    balance_amount: Math.round(balance_amount * 100) / 100,
  };
}

// ─── Quick Number Gen ─────────────────────────────────────────────────────────

export function generateQuotationNumber(prefix = 'PP', counter?: number): string {
  const year = new Date().getFullYear();
  const seq = counter
    ? String(counter).padStart(4, '0')
    : String(Date.now()).slice(-6);
  return `${prefix}-${year}-${seq}`;
}

// ─── Validity Date ────────────────────────────────────────────────────────────

export function calcValidUntil(date: string, days = 15): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
