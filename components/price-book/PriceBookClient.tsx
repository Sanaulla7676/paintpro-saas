'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getBrandBg, cn } from '@/lib/utils';
import { Search, Check, Loader2 } from 'lucide-react';

const BRANDS = ['All Brands', 'Berger Paints', 'Asian Paints', 'Birla Opus'];
const PACK_SIZES = ['1L', '4L', '10L', '20L', '1 kg', '5 kg', '10 kg', '20 kg', '15 kg', '25 kg'];

interface Price {
  id: string;
  pack_size: string;
  unit: string;
  mrp: number | null;
  working_price: number | null;
  dealer_price: number | null;
}

interface ProductWithPrices {
  id: string;
  brand: string;
  name: string;
  category: string;
  subcategory: string;
  initials: string;
  pack_sizes: string[];
  product_prices: Price[];
}

interface PriceBookClientProps {
  products: ProductWithPrices[];
}

export function PriceBookClient({ products: initialProducts }: PriceBookClientProps) {
  const supabase = createClient();

  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('All Brands');
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [pendingPrices, setPendingPrices] = useState<Record<string, Record<string, Partial<Price>>>>({});

  const filtered = products.filter((p) => {
    if (brand !== 'All Brands' && p.brand !== brand) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    }
    return true;
  });

  function updatePendingPrice(productId: string, packSize: string, field: keyof Price, value: number) {
    setPendingPrices((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [packSize]: {
          ...prev[productId]?.[packSize],
          [field]: value,
        },
      },
    }));
  }

  async function saveProductPrices(product: ProductWithPrices) {
    const pending = pendingPrices[product.id];
    if (!pending) return;

    setSaving((prev) => ({ ...prev, [product.id]: true }));

    try {
      for (const [packSize, prices] of Object.entries(pending)) {
        const existingPrice = product.product_prices.find((p) => p.pack_size === packSize);

        if (existingPrice) {
          // Update existing
          await supabase.from('product_prices').update({
            mrp: prices.mrp ?? existingPrice.mrp,
            working_price: prices.working_price ?? existingPrice.working_price,
            dealer_price: prices.dealer_price ?? existingPrice.dealer_price,
          }).eq('id', existingPrice.id);
        } else {
          // Insert new
          await supabase.from('product_prices').insert({
            product_id: product.id,
            pack_size: packSize,
            unit: packSize.includes('kg') ? 'kg' : 'L',
            mrp: prices.mrp ?? null,
            working_price: prices.working_price ?? null,
            dealer_price: prices.dealer_price ?? null,
          });
        }
      }

      // Refresh this product's prices
      const { data: refreshed } = await supabase
        .from('product_prices')
        .select('*')
        .eq('product_id', product.id);

      setProducts((prev) =>
        prev.map((p) => p.id === product.id ? { ...p, product_prices: refreshed || [] } : p)
      );

      // Clear pending
      setPendingPrices((prev) => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });

      setSaved((prev) => ({ ...prev, [product.id]: true }));
      setTimeout(() => setSaved((prev) => ({ ...prev, [product.id]: false })), 2000);
    } finally {
      setSaving((prev) => ({ ...prev, [product.id]: false }));
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight">Price Book</h1>
        <p className="text-sm text-muted mt-0.5">
          Set your working prices per product and pack size. These will auto-fill into quotations.
        </p>
      </div>

      <div className="panel">
        {/* Filters */}
        <div className="p-4 border-b border-[#e5e1da] space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 border border-[#d9d4cd] rounded-xl text-sm outline-none focus:border-[#c19b62]"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {BRANDS.map((b) => (
              <button key={b} onClick={() => setBrand(b)}
                className={cn('pill whitespace-nowrap', brand === b ? 'active' : '')}>
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Product rows with inline price editing */}
        <div className="divide-y divide-[#e5e1da]">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-muted text-sm">No products match your filters.</div>
          ) : (
            filtered.map((product) => {
              const hasPending = !!pendingPrices[product.id] && Object.keys(pendingPrices[product.id]).length > 0;
              const isSaving = saving[product.id];
              const wasSaved = saved[product.id];

              // Determine which pack sizes to show (existing prices + common defaults)
              const existingSizes = product.product_prices.map((p) => p.pack_size);
              const displaySizes = [...new Set([...existingSizes, ...(product.pack_sizes || []).slice(0, 2)])];

              return (
                <div key={product.id} className="p-4">
                  {/* Product header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={cn('prod-art w-12 h-12 text-sm shrink-0', getBrandBg(product.brand))}>
                      {product.initials || product.name.substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm">{product.name}</div>
                      <div className="text-xs text-muted">{product.brand} · {product.category}</div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {hasPending && (
                        <button
                          onClick={() => saveProductPrices(product)}
                          disabled={isSaving}
                          className="h-8 px-4 rounded-xl font-bold text-xs text-white flex items-center gap-1.5"
                          style={{ background: isSaving ? '#aaa' : '#d2ad76' }}>
                          {isSaving ? <><Loader2 size={12} className="animate-spin" /> Saving…</> : 'Save Prices'}
                        </button>
                      )}
                      {wasSaved && !hasPending && (
                        <span className="h-8 px-3 rounded-xl font-bold text-xs text-green-700 bg-green-50 border border-green-200 flex items-center gap-1">
                          <Check size={12} /> Saved
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price grid */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs" style={{ minWidth: 500 }}>
                      <thead>
                        <tr className="bg-[#f7f4ef]">
                          <th className="px-3 py-2 text-left text-[9px] font-black uppercase tracking-wider text-muted">Pack Size</th>
                          <th className="px-3 py-2 text-left text-[9px] font-black uppercase tracking-wider text-muted">MRP ₹</th>
                          <th className="px-3 py-2 text-left text-[9px] font-black uppercase tracking-wider text-muted">Working Price ₹</th>
                          <th className="px-3 py-2 text-left text-[9px] font-black uppercase tracking-wider text-muted">Dealer Price ₹</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displaySizes.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-3 py-4 text-center text-muted text-xs">
                              No pack sizes defined. Enter prices below to add.
                            </td>
                          </tr>
                        ) : (
                          displaySizes.map((size) => {
                            const existing = product.product_prices.find((p) => p.pack_size === size);
                            const pending = pendingPrices[product.id]?.[size] || {};

                            return (
                              <tr key={size} className="border-t border-[#e5e1da]">
                                <td className="px-3 py-2 font-bold">{size}</td>
                                {(['mrp', 'working_price', 'dealer_price'] as const).map((field) => (
                                  <td key={field} className="px-3 py-2">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      placeholder="—"
                                      defaultValue={existing?.[field] ?? ''}
                                      onChange={(e) => updatePendingPrice(
                                        product.id,
                                        size,
                                        field,
                                        parseFloat(e.target.value) || 0
                                      )}
                                      className="w-full h-8 border border-[#d8d3cc] rounded-lg px-2 text-xs bg-white outline-none focus:border-[#c19b62]"
                                    />
                                  </td>
                                ))}
                              </tr>
                            );
                          })
                        )}
                        {/* Add a new pack size row */}
                        <tr className="border-t border-[#e5e1da] bg-[#fbfaf8]">
                          <td className="px-3 py-2">
                            <select
                              defaultValue=""
                              onChange={(e) => {
                                const size = e.target.value;
                                if (size && !displaySizes.includes(size)) {
                                  updatePendingPrice(product.id, size, 'working_price', 0);
                                  // Force re-render by adding to display sizes
                                  setProducts((prev) =>
                                    prev.map((p) => p.id === product.id
                                      ? { ...p, pack_sizes: [...(p.pack_sizes || []), size] }
                                      : p
                                    )
                                  );
                                }
                                e.target.value = '';
                              }}
                              className="h-7 border border-dashed border-[#d8d3cc] rounded-lg px-2 text-xs bg-white outline-none"
                            >
                              <option value="">+ Add pack size…</option>
                              {PACK_SIZES.filter((s) => !displaySizes.includes(s)).map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                          <td colSpan={3} />
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
