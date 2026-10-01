'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Quotation, QuotationItem, Room } from '@/types/quotation';
import { uid, toDateString, addDays } from '@/lib/utils';
import { calcQuotationTotals, generateQuotationNumber } from '@/lib/calculations';
import type { Product } from '@/types/catalog';

function freshQuotation(): Quotation {
  const today = toDateString();
  return {
    quotation_number: generateQuotationNumber('PP'),
    quotation_date: today,
    valid_until: toDateString(addDays(new Date(), 15)),
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_city: '',
    site_address: '',
    project_name: '',
    property_type: 'Apartment',
    project_type: 'Residential',
    floors: 1,
    subtotal: 0,
    discount_percent: 0,
    discount_amount: 0,
    taxable_amount: 0,
    gst_percent: 18,
    gst_amount: 0,
    grand_total: 0,
    advance_percent: 30,
    advance_amount: 0,
    balance_amount: 0,
    labour_interior_rate: 0,
    labour_exterior_rate: 0,
    status: 'Draft',
    terms: 'Payment: 30% advance, balance on completion.\nScope includes material and labour as specified above.',
    notes: '',
    rooms: [],
    items: [],
  };
}

interface QuotationStore {
  draft: Quotation;
  savedQuotes: Quotation[];
  pendingProduct: Product | null;

  // Draft actions
  updateDraft: (updates: Partial<Quotation>) => void;
  addRoom: () => void;
  updateRoom: (roomId: string, updates: Partial<Room>) => void;
  removeRoom: (roomId: string) => void;
  addItem: () => void;
  addProduct: (product: Product) => void;
  updateItem: (itemId: string, updates: Partial<QuotationItem>) => void;
  removeItem: (itemId: string) => void;
  addLabourLine: (zone: 'Interior' | 'Exterior', area: number) => void;
  recalculate: () => void;
  newQuotation: () => void;
  loadQuotation: (q: Quotation) => void;
  clearPendingProduct: () => void;

  // Saved quotes (local backup)
  saveLocal: (q: Quotation) => void;
  loadLocal: (number: string) => void;
}

export const useQuotationStore = create<QuotationStore>()(
  persist(
    (set, get) => ({
      draft: freshQuotation(),
      savedQuotes: [],
      pendingProduct: null,

      updateDraft: (updates) =>
        set((state) => ({ draft: { ...state.draft, ...updates } })),

      addRoom: () =>
        set((state) => ({
          draft: {
            ...state.draft,
            rooms: [
              ...state.draft.rooms,
              {
                id: uid(),
                name: `Room ${state.draft.rooms.length + 1}`,
                room_type: 'Bedroom',
                zone: 'Interior',
                length_ft: 12,
                width_ft: 10,
                height_ft: 10,
                openings_sqft: 0,
                surface_condition: 'New Plaster',
                notes: '',
              } satisfies Room,
            ],
          },
        })),

      updateRoom: (roomId, updates) =>
        set((state) => ({
          draft: {
            ...state.draft,
            rooms: state.draft.rooms.map((r) =>
              r.id === roomId ? { ...r, ...updates } : r
            ),
          },
        })),

      removeRoom: (roomId) =>
        set((state) => ({
          draft: {
            ...state.draft,
            rooms: state.draft.rooms.filter((r) => r.id !== roomId),
            items: state.draft.items.map((item) => {
              const room = state.draft.rooms.find((r) => r.id === roomId);
              return item.room_name === room?.name ? { ...item, room_name: '' } : item;
            }),
          },
        })),

      addItem: () =>
        set((state) => ({
          draft: {
            ...state.draft,
            items: [
              ...state.draft.items,
              {
                id: uid(),
                item_type: 'Material',
                room_name: state.draft.rooms[0]?.name || '',
                zone: 'Interior',
                work_type: 'Topcoat',
                description: '',
                area_sqft: 0,
                coats: 2,
                coverage: 0,
                quantity: 1,
                unit: 'L',
                rate: 0,
                amount: 0,
                sort_order: state.draft.items.length,
              } satisfies QuotationItem,
            ],
          },
        })),

      addProduct: (product) =>
        set((state) => ({
          pendingProduct: product,
          draft: {
            ...state.draft,
            items: [
              ...state.draft.items,
              {
                id: uid(),
                item_type: 'Material',
                room_name: state.draft.rooms[0]?.name || '',
                zone: 'Interior',
                work_type: 'Topcoat',
                product_id: product.id,
                product_name: product.name,
                description: product.name,
                area_sqft: 0,
                coats: product.recommended_coats || 2,
                coverage: product.coverage || 0,
                quantity: 1,
                unit: 'L',
                rate: product.working_price || 0,
                amount: 0,
                sort_order: state.draft.items.length,
              } satisfies QuotationItem,
            ],
          },
        })),

      clearPendingProduct: () => set({ pendingProduct: null }),

      updateItem: (itemId, updates) =>
        set((state) => ({
          draft: {
            ...state.draft,
            items: state.draft.items.map((item) =>
              item.id === itemId ? { ...item, ...updates } : item
            ),
          },
        })),

      removeItem: (itemId) =>
        set((state) => ({
          draft: {
            ...state.draft,
            items: state.draft.items.filter((item) => item.id !== itemId),
          },
        })),

      addLabourLine: (zone, area) =>
        set((state) => {
          const rate = zone === 'Exterior'
            ? state.draft.labour_exterior_rate
            : state.draft.labour_interior_rate;
          return {
            draft: {
              ...state.draft,
              items: [
                ...state.draft.items,
                {
                  id: uid(),
                  item_type: 'Labour',
                  room_name: 'Project level',
                  zone,
                  work_type: 'Labour',
                  description: `${zone} Labour`,
                  area_sqft: area,
                  coats: 1,
                  coverage: 0,
                  quantity: area,
                  unit: 'sq.ft',
                  rate,
                  amount: area * rate,
                  manual_qty: true,
                  sort_order: state.draft.items.length,
                } satisfies QuotationItem,
              ],
            },
          };
        }),

      recalculate: () =>
        set((state) => {
          const totals = calcQuotationTotals(state.draft);
          return { draft: { ...state.draft, ...totals } };
        }),

      newQuotation: () =>
        set({ draft: freshQuotation(), pendingProduct: null }),

      loadQuotation: (q) =>
        set({ draft: q, pendingProduct: null }),

      saveLocal: (q) =>
        set((state) => {
          const existing = state.savedQuotes.findIndex(
            (s) => s.quotation_number === q.quotation_number
          );
          const saved = [...state.savedQuotes];
          if (existing >= 0) saved[existing] = q;
          else saved.unshift(q);
          return { savedQuotes: saved.slice(0, 50) }; // keep max 50
        }),

      loadLocal: (number) =>
        set((state) => {
          const q = state.savedQuotes.find((s) => s.quotation_number === number);
          if (q) return { draft: JSON.parse(JSON.stringify(q)) };
          return state;
        }),
    }),
    {
      name: 'paintpro-quotation-store',
      version: 1,
    }
  )
);
