import { describe, it, expect } from 'vitest';
import {
  calcRoomAreas,
  calcMeasurementSummary,
  calcPaintQuantity,
  calcQuotationTotals,
  calcLineItem,
} from '@/lib/calculations';
import type { Room, Quotation, QuotationItem } from '@/types/quotation';

// ─── Room Calculations ────────────────────────────────────────────────────────

describe('calcRoomAreas', () => {
  it('calculates wall area: 2 × (L + W) × H', () => {
    const room: Room = {
      id: '1', name: 'Bedroom', room_type: 'Bedroom', zone: 'Interior',
      length_ft: 12, width_ft: 10, height_ft: 10,
      openings_sqft: 0, surface_condition: 'New Plaster',
    };
    const areas = calcRoomAreas(room);
    // 2 × (12 + 10) × 10 = 440
    expect(areas.wall_area_sqft).toBe(440);
  });

  it('deducts openings from net wall area', () => {
    const room: Room = {
      id: '1', name: 'Living', room_type: 'Living Room', zone: 'Interior',
      length_ft: 15, width_ft: 12, height_ft: 10,
      openings_sqft: 60, surface_condition: 'New Plaster',
    };
    const areas = calcRoomAreas(room);
    // 2 × (15 + 12) × 10 = 540; net = 540 - 60 = 480
    expect(areas.wall_area_sqft).toBe(540);
    expect(areas.net_wall_area_sqft).toBe(480);
  });

  it('calculates ceiling: L × W', () => {
    const room: Room = {
      id: '1', name: 'Kitchen', room_type: 'Kitchen', zone: 'Interior',
      length_ft: 10, width_ft: 8, height_ft: 9,
      openings_sqft: 0, surface_condition: 'New Plaster',
    };
    const areas = calcRoomAreas(room);
    // 10 × 8 = 80
    expect(areas.ceiling_area_sqft).toBe(80);
  });

  it('does not allow negative net wall area', () => {
    const room: Room = {
      id: '1', name: 'Tiny', room_type: 'Bathroom', zone: 'Interior',
      length_ft: 5, width_ft: 4, height_ft: 8,
      openings_sqft: 999, surface_condition: 'New Plaster',
    };
    const areas = calcRoomAreas(room);
    expect(areas.net_wall_area_sqft).toBeGreaterThanOrEqual(0);
  });

  it('calculates total area = net wall + ceiling', () => {
    const room: Room = {
      id: '1', name: 'Master', room_type: 'Master Bedroom', zone: 'Interior',
      length_ft: 14, width_ft: 12, height_ft: 10,
      openings_sqft: 40, surface_condition: 'New Plaster',
    };
    const areas = calcRoomAreas(room);
    expect(areas.total_area_sqft).toBe(areas.net_wall_area_sqft + areas.ceiling_area_sqft);
  });
});

// ─── Measurement Summary ──────────────────────────────────────────────────────

describe('calcMeasurementSummary', () => {
  const rooms: Room[] = [
    { id: '1', name: 'Bedroom', room_type: 'Bedroom', zone: 'Interior',
      length_ft: 12, width_ft: 10, height_ft: 10, openings_sqft: 0, surface_condition: 'New Plaster' },
    { id: '2', name: 'Exterior Front', room_type: 'Exterior Front', zone: 'Exterior',
      length_ft: 20, width_ft: 5, height_ft: 12, openings_sqft: 0, surface_condition: 'New Plaster' },
  ];

  it('separates interior vs exterior walls correctly', () => {
    const summary = calcMeasurementSummary(rooms);
    // Bedroom interior walls: 2 × (12+10) × 10 = 440, ceiling 12×10=120
    // Exterior: 2 × (20+5) × 12 = 600
    expect(summary.total_interior_wall).toBe(440);
    expect(summary.total_exterior_wall).toBe(600);
    expect(summary.total_ceiling).toBe(120);
  });

  it('counts rooms correctly', () => {
    const summary = calcMeasurementSummary(rooms);
    expect(summary.room_count).toBe(2);
  });
});

// ─── Paint Quantity ───────────────────────────────────────────────────────────

describe('calcPaintQuantity', () => {
  it('calculates: area × coats ÷ coverage', () => {
    // 2000 sq.ft × 2 coats ÷ 100 sq.ft/unit = 40 units
    expect(calcPaintQuantity(2000, 2, 100)).toBe(40);
  });

  it('handles zero coverage gracefully', () => {
    expect(calcPaintQuantity(1000, 2, 0)).toBe(0);
  });

  it('returns 0 for zero area', () => {
    expect(calcPaintQuantity(0, 2, 100)).toBe(0);
  });
});

// ─── Quotation Totals ─────────────────────────────────────────────────────────

function makeQuotation(overrides: Partial<Quotation> = {}): Quotation {
  return {
    quotation_number: 'PP-2025-001',
    quotation_date: '2025-01-01',
    valid_until: '2025-01-15',
    subtotal: 0,
    discount_percent: 0,
    discount_amount: 0,
    taxable_amount: 0,
    gst_percent: 18,
    gst_amount: 0,
    grand_total: 0,
    advance_percent: 0,
    advance_amount: 0,
    balance_amount: 0,
    labour_interior_rate: 0,
    labour_exterior_rate: 0,
    status: 'Draft',
    rooms: [],
    items: [],
    ...overrides,
  };
}

describe('calcQuotationTotals', () => {
  it('calculates subtotal from items', () => {
    const items: QuotationItem[] = [
      { id: '1', item_type: 'Material', zone: 'Interior', work_type: 'Topcoat',
        description: 'Test', area_sqft: 0, coats: 1, coverage: 0,
        quantity: 5, unit: 'L', rate: 200, amount: 1000, manual_qty: true },
      { id: '2', item_type: 'Labour', zone: 'Interior', work_type: 'Labour',
        description: 'Labour', area_sqft: 0, coats: 1, coverage: 0,
        quantity: 1, unit: 'job', rate: 500, amount: 500, manual_qty: true },
    ];
    const q = makeQuotation({ items });
    const totals = calcQuotationTotals(q);
    expect(totals.subtotal).toBe(1500);
  });

  it('applies discount correctly', () => {
    const items: QuotationItem[] = [
      { id: '1', item_type: 'Material', zone: 'Interior', work_type: 'Topcoat',
        description: 'Test', area_sqft: 0, coats: 1, coverage: 0,
        quantity: 1, unit: 'L', rate: 10000, amount: 10000, manual_qty: true },
    ];
    const q = makeQuotation({ items, discount_percent: 10 });
    const totals = calcQuotationTotals(q);
    // subtotal = 10000, discount = 1000, taxable = 9000
    expect(totals.subtotal).toBe(10000);
    expect(totals.discount_amount).toBe(1000);
    expect(totals.taxable_amount).toBe(9000);
  });

  it('applies GST correctly', () => {
    const items: QuotationItem[] = [
      { id: '1', item_type: 'Material', zone: 'Interior', work_type: 'Topcoat',
        description: 'Test', area_sqft: 0, coats: 1, coverage: 0,
        quantity: 1, unit: 'L', rate: 10000, amount: 10000, manual_qty: true },
    ];
    const q = makeQuotation({ items, gst_percent: 18 });
    const totals = calcQuotationTotals(q);
    // taxable = 10000, GST 18% = 1800, grand total = 11800
    expect(totals.gst_amount).toBe(1800);
    expect(totals.grand_total).toBe(11800);
  });

  it('calculates advance and balance', () => {
    const items: QuotationItem[] = [
      { id: '1', item_type: 'Material', zone: 'Interior', work_type: 'Topcoat',
        description: 'Test', area_sqft: 0, coats: 1, coverage: 0,
        quantity: 1, unit: 'L', rate: 10000, amount: 10000, manual_qty: true },
    ];
    const q = makeQuotation({ items, gst_percent: 0, advance_percent: 30 });
    const totals = calcQuotationTotals(q);
    // grand total = 10000, advance 30% = 3000, balance = 7000
    expect(totals.advance_amount).toBe(3000);
    expect(totals.balance_amount).toBe(7000);
  });

  it('grand total = taxable + GST', () => {
    const items: QuotationItem[] = [
      { id: '1', item_type: 'Material', zone: 'Interior', work_type: 'Topcoat',
        description: 'Test', area_sqft: 0, coats: 1, coverage: 0,
        quantity: 1, unit: 'L', rate: 5000, amount: 5000, manual_qty: true },
    ];
    const q = makeQuotation({ items, discount_percent: 5, gst_percent: 18 });
    const totals = calcQuotationTotals(q);
    expect(Math.round(totals.grand_total * 100)).toBe(
      Math.round((totals.taxable_amount + totals.gst_amount) * 100)
    );
  });
});
