'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Copy, Check, Palette, Sparkles } from 'lucide-react';
import type { Shade } from '@/types/catalog';

const CURATED_DEFAULT_SHADES: Shade[] = [
  { id: 'sh-1', brand: 'Berger Paints', code: '1P2048', name: 'Airy Cream', family: 'Whites & Creams', hex: '#efe1c9' },
  { id: 'sh-2', brand: 'Berger Paints', code: '1P2049', name: 'Airy Lemon', family: 'Yellows & Warm', hex: '#dbc7aa' },
  { id: 'sh-3', brand: 'Berger Paints', code: '1P2050', name: 'Alligator Alley', family: 'Earth & Browns', hex: '#cfaa8e' },
  { id: 'sh-4', brand: 'Berger Paints', code: '1P2051', name: "All's Quiet", family: 'Earth & Browns', hex: '#b97e69' },
  { id: 'sh-5', brand: 'Berger Paints', code: '1P2052', name: 'Almond Bowl', family: 'Earth & Browns', hex: '#8f5849' },
  { id: 'sh-6', brand: 'Berger Paints', code: '1P2053', name: 'Almond Biscotti', family: 'Greens', hex: '#b9c4b0' },
  { id: 'sh-7', brand: 'Asian Paints', code: '0943', name: 'Morning Frost', family: 'Whites & Creams', hex: '#eceae4' },
  { id: 'sh-8', brand: 'Asian Paints', code: '7412', name: 'Pistachio Cream', family: 'Greens', hex: '#93aa95' },
  { id: 'sh-9', brand: 'Asian Paints', code: '8114', name: 'Vintage Rose', family: 'Pastels & Pinks', hex: '#d7bcc8' },
  { id: 'sh-10', brand: 'Asian Paints', code: '9133', name: 'Pacific Breeze', family: 'Blues', hex: '#9aa6c0' },
  { id: 'sh-11', brand: 'Asian Paints', code: '8401', name: 'Lavender Mist', family: 'Pastels & Pinks', hex: '#c1b3d3' },
  { id: 'sh-12', brand: 'Asian Paints', code: '7920', name: 'Sunbeam Gold', family: 'Yellows & Warm', hex: '#dfc66d' },
  { id: 'sh-13', brand: 'Asian Paints', code: '8522', name: 'Warm Khaki', family: 'Earth & Browns', hex: '#b9a377' },
  { id: 'sh-14', brand: 'Asian Paints', code: '0956', name: 'Silver Ash', family: 'Grays & Neutrals', hex: '#aeb2ae' },
  { id: 'sh-15', brand: 'Asian Paints', code: '0612', name: 'Charcoal Shadow', family: 'Grays & Neutrals', hex: '#71787d' },
  { id: 'sh-16', brand: 'Asian Paints', code: '0624', name: 'Deep Graphite', family: 'Darks & Accents', hex: '#454b4e' },
  { id: 'sh-17', brand: 'Berger Paints', code: '2P1180', name: 'Blush Symphony', family: 'Pastels & Pinks', hex: '#edc3b5' },
  { id: 'sh-18', brand: 'Berger Paints', code: '2P1192', name: 'Terracotta Dune', family: 'Earth & Browns', hex: '#d48674' },
  { id: 'sh-19', brand: 'Asian Paints', code: 'L102', name: 'Absolute White', family: 'Whites & Creams', hex: '#fbfbf9' },
  { id: 'sh-20', brand: 'Asian Paints', code: 'L152', name: 'Soft Pearl', family: 'Whites & Creams', hex: '#f4f1ea' },
  { id: 'sh-21', brand: 'Berger Paints', code: '0101', name: 'Classic Magnolia', family: 'Whites & Creams', hex: '#f7f2e7' },
  { id: 'sh-22', brand: 'Asian Paints', code: '7302', name: 'Sage Garden', family: 'Greens', hex: '#a2b49c' },
  { id: 'sh-23', brand: 'Asian Paints', code: '7344', name: 'Forest Moss', family: 'Greens', hex: '#5f705c' },
  { id: 'sh-24', brand: 'Asian Paints', code: '9120', name: 'Ocean Whisper', family: 'Blues', hex: '#b8cdd8' },
  { id: 'sh-25', brand: 'Berger Paints', code: '5D0280', name: 'Midnight Navy', family: 'Blues', hex: '#2c3e50' },
  { id: 'sh-26', brand: 'Asian Paints', code: '7840', name: 'Tuscan Sun', family: 'Yellows & Warm', hex: '#e9b949' },
  { id: 'sh-27', brand: 'Berger Paints', code: '3T0450', name: 'Copper Glow', family: 'Earth & Browns', hex: '#bd6a47' },
  { id: 'sh-28', brand: 'Asian Paints', code: '8024', name: 'Warm Terracotta', family: 'Earth & Browns', hex: '#a85842' },
];

const FAMILIES = [
  'All Families',
  'Whites & Creams',
  'Earth & Browns',
  'Yellows & Warm',
  'Greens',
  'Blues',
  'Pastels & Pinks',
  'Grays & Neutrals',
  'Darks & Accents',
];

interface ShadesClientProps {
  initialShades: Shade[];
}

export function ShadesClient({ initialShades }: ShadesClientProps) {
  const shades = initialShades && initialShades.length > 0 ? initialShades : CURATED_DEFAULT_SHADES;

  const [search, setSearch] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('All Families');
  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const brands = useMemo(() => {
    const list = Array.from(new Set(shades.map((s) => s.brand).filter(Boolean)));
    return ['All Brands', ...list];
  }, [shades]);

  const filteredShades = useMemo(() => {
    const q = search.trim().toLowerCase();
    return shades.filter((s) => {
      const matchBrand = selectedBrand === 'All Brands' || s.brand === selectedBrand;
      const matchFamily = selectedFamily === 'All Families' || s.family === selectedFamily;
      const matchQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.brand.toLowerCase().includes(q) ||
        s.hex.toLowerCase().includes(q);

      return matchBrand && matchFamily && matchQuery;
    });
  }, [shades, search, selectedFamily, selectedBrand]);

  function copyToClipboard(text: string, code: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 1800);
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="crumb">
        <Link href="/products" className="hover:underline">Catalog</Link>
        <span>›</span>
        <span>Shade Finder</span>
      </div>

      <section className="panel">
        <div className="panel-head flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black">Colour Shade Finder</h1>
            <p className="text-xs text-muted mt-0.5">
              Digital architectural colour library across Berger, Asian Paints, and Dulux
            </p>
          </div>
          <span className="text-xs font-bold text-muted bg-[#f2eee9] px-3 py-1.5 rounded-xl">
            {filteredShades.length} shades found
          </span>
        </div>

        <div className="p-6 space-y-5">
          {/* Search bar & Brand dropdown */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search shade name (e.g. Airy Cream), shade code (e.g. 1P2048), or HEX…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#d8d3cc] bg-white text-sm outline-none focus:border-[#d2ad76]"
              />
            </div>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="h-11 px-4 rounded-xl border border-[#d8d3cc] bg-white text-sm font-semibold outline-none focus:border-[#d2ad76]"
            >
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Family pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {FAMILIES.map((fam) => (
              <button
                key={fam}
                onClick={() => setSelectedFamily(fam)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedFamily === fam
                    ? 'bg-[#1f2528] text-white shadow-soft'
                    : 'bg-[#f4efe8] text-[#6d7478] hover:bg-[#eae3d9]'
                }`}
              >
                {fam}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-muted italic">
            * Note: Actual paint appearance will vary with natural lighting, substrate porosity, coats applied, and display calibration.
          </p>

          {/* Swatches Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {filteredShades.map((shade) => {
              const isCopied = copiedCode === shade.code;
              return (
                <div
                  key={shade.code + shade.brand}
                  className="rounded-2xl border border-[#e5e1da] bg-white overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col"
                >
                  {/* Swatch preview */}
                  <div
                    className="h-24 w-full relative flex items-end p-2 cursor-pointer transition-transform group-hover:scale-[1.02]"
                    style={{ backgroundColor: shade.hex }}
                    onClick={() => copyToClipboard(shade.hex, shade.code)}
                    title="Click to copy HEX"
                  >
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/40 text-white backdrop-blur-sm">
                      {shade.hex.toUpperCase()}
                    </span>
                  </div>

                  {/* Shade info */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="font-bold text-xs text-ink truncate" title={shade.name}>
                        {shade.name}
                      </div>
                      <div className="text-[10px] text-muted truncate mt-0.5">
                        {shade.brand} · <span className="font-mono font-semibold">{shade.code}</span>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-[#f0ece4] flex items-center justify-between">
                      <span className="text-[9px] text-[#938b81] uppercase font-bold truncate max-w-[80px]">
                        {shade.family || 'Paint'}
                      </span>
                      <button
                        onClick={() => copyToClipboard(`${shade.brand} - ${shade.name} (${shade.code})`, shade.code)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 transition-all ${
                          isCopied
                            ? 'bg-green-100 text-green-700'
                            : 'bg-[#f4efe8] text-[#6d7478] hover:bg-[#d2ad76] hover:text-white'
                        }`}
                        title="Copy shade details"
                      >
                        {isCopied ? (
                          <>
                            <Check size={11} /> Copied
                          </>
                        ) : (
                          <>
                            <Copy size={11} /> Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredShades.length === 0 && (
            <div className="py-16 text-center text-muted text-sm">
              No colour shades matched your search criteria.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
