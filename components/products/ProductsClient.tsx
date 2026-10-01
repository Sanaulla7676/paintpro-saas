'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getBrandBg, cn } from '@/lib/utils';
import { Search, Star, Plus, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import type { Product } from '@/types/catalog';

const BRANDS = ['All Brands', 'Berger Paints', 'Asian Paints', 'Birla Opus'];
const PAGE_SIZE = 18;

interface ProductsClientProps {
  initialProducts: Product[];
  totalCount: number;
  favorites: string[];
}

export function ProductsClient({ initialProducts, totalCount, favorites: initialFavorites }: ProductsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [products, setProducts] = useState(initialProducts);
  const [total, setTotal] = useState(totalCount);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [brand, setBrand] = useState(searchParams.get('brand') || 'All Brands');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('Featured');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(initialFavorites));
  const [toast, setToast] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  }, []);

  // Fetch unique categories from the current brand
  useEffect(() => {
    supabase.from('products').select('category').eq('active', true)
      .then(({ data }) => {
        if (data) setCategories([...new Set(data.map((p) => p.category as string))].sort());
      });
  }, []);

  // Load products with filters
  const loadProducts = useCallback(async (pg = 1, currentSearch = search, currentBrand = brand, currentCategory = category, currentSort = sort) => {
    setLoading(true);
    try {
      let query = supabase.from('products').select('*', { count: 'exact' }).eq('active', true);

      if (currentBrand !== 'All Brands') query = query.eq('brand', currentBrand);
      if (currentCategory) query = query.eq('category', currentCategory);
      if (currentSearch) {
        query = query.or(
          `name.ilike.%${currentSearch}%,brand.ilike.%${currentSearch}%,category.ilike.%${currentSearch}%,subcategory.ilike.%${currentSearch}%,description.ilike.%${currentSearch}%`
        );
      }

      if (currentSort === 'Name A–Z') query = query.order('name', { ascending: true });
      else if (currentSort === 'Brand') query = query.order('brand').order('name');
      else query = query.order('brand').order('category').order('name');

      query = query.range((pg - 1) * PAGE_SIZE, pg * PAGE_SIZE - 1);

      const { data, count } = await query;
      setProducts(data || []);
      setTotal(count || 0);
      setPage(pg);
    } finally {
      setLoading(false);
    }
  }, [supabase, search, brand, category, sort]);

  // Debounce search
  function handleSearchChange(val: string) {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => loadProducts(1, val, brand, category, sort), 300);
  }

  function handleFilter(b: string, cat: string, s: string) {
    setBrand(b); setCategory(cat); setSort(s);
    loadProducts(1, search, b, cat, s);
  }

  async function toggleFav(productId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (favorites.has(productId)) {
      await supabase.from('favorites').delete().eq('owner_id', user.id).eq('product_id', productId);
      setFavorites((prev) => { const s = new Set(prev); s.delete(productId); return s; });
      showToast('Removed from saved');
    } else {
      await supabase.from('favorites').insert({ owner_id: user.id, product_id: productId });
      setFavorites((prev) => new Set([...prev, productId]));
      showToast('Product saved ♥');
    }
  }

  function toggleCompare(id: string) {
    setCompareList((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) { showToast('Max 4 products to compare'); return prev; }
      return [...prev, id];
    });
  }

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Products</h1>
          <p className="text-sm text-muted mt-0.5">{total.toLocaleString('en-IN')} products across 3 brands</p>
        </div>
        <div className="sm:ml-auto flex gap-2">
          <button onClick={() => setShowFilters(!showFilters)}
            className="pill flex items-center gap-1.5">
            <SlidersHorizontal size={13} /> Filters
          </button>
          {compareList.length >= 2 && (
            <Link href={`/products/compare?ids=${compareList.join(',')}`}
              className="pill active flex items-center gap-1">
              Compare ({compareList.length})
            </Link>
          )}
        </div>
      </div>

      {/* Search + Brand Tabs */}
      <div className="panel">
        {/* Search */}
        <div className="p-4 border-b border-[#e5e1da]">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              placeholder="Search by product name, category, brand, description…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-11 pl-10 pr-4 border border-[#d9d4cd] rounded-2xl bg-white outline-none focus:border-[#c19b62] focus:shadow-[0_0_0_3px_#c19b6222] text-sm transition-all"
            />
          </div>
        </div>

        {/* Brand Pills */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto border-b border-[#e5e1da] no-scrollbar">
          {BRANDS.map((b) => (
            <button key={b}
              onClick={() => handleFilter(b, category, sort)}
              className={cn('pill whitespace-nowrap', brand === b ? 'active' : '')}>
              {b}
            </button>
          ))}
        </div>

        {/* Category + Sort filters */}
        {showFilters && (
          <div className="px-4 py-3 border-b border-[#e5e1da] flex flex-wrap gap-2">
            <select
              value={category}
              onChange={(e) => handleFilter(brand, e.target.value, sort)}
              className="h-9 border border-[#d9d4cd] rounded-xl px-3 text-sm bg-white outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={sort}
              onChange={(e) => handleFilter(brand, category, e.target.value)}
              className="h-9 border border-[#d9d4cd] rounded-xl px-3 text-sm bg-white outline-none"
            >
              <option>Featured</option>
              <option>Name A–Z</option>
              <option>Brand</option>
            </select>
            {(category || search || brand !== 'All Brands') && (
              <button onClick={() => { setSearch(''); setBrand('All Brands'); setCategory(''); handleFilter('All Brands', '', sort); }}
                className="flex items-center gap-1 text-sm text-muted hover:text-ink">
                <X size={13} /> Clear
              </button>
            )}
          </div>
        )}

        {/* Product List */}
        <div id="productList">
          {loading ? (
            <div className="py-16 flex justify-center items-center gap-3 text-muted">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Loading products…
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center text-muted text-sm">
              No products match your filters.
              <button onClick={() => handleFilter('All Brands', '', sort)} className="ml-2 font-semibold" style={{ color: '#8b652e' }}>
                Clear filters
              </button>
            </div>
          ) : (
            products.map((p) => (
              <article key={p.id} className="product-row">
                <div className={cn('prod-art w-[54px] h-[54px] text-[13px]', getBrandBg(p.brand))}>
                  {p.initials || p.name.substring(0, 2)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm truncate">{p.name}</h3>
                  <div className="text-[11px] text-muted mt-0.5">{p.brand} · {p.category} · {p.subcategory}</div>
                  <div className="text-[11px] text-[#72797d] mt-1.5 leading-snug hidden sm:block line-clamp-2">{p.description}</div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => toggleFav(p.id)}
                    aria-label={favorites.has(p.id) ? 'Remove from saved' : 'Save product'}
                    className={cn('icon-btn w-9 h-9 flex items-center justify-center rounded-xl border text-sm transition-colors',
                      favorites.has(p.id) ? 'bg-[#f4ead9] border-[#e5d0ab] text-[#87632e]' : 'bg-white border-[#dfdad2] text-[#656c70]'
                    )}>
                    <Star size={15} fill={favorites.has(p.id) ? 'currentColor' : 'none'} />
                  </button>
                  <Link href={`/products/${p.id}`}
                    className="icon-btn w-9 h-9 flex items-center justify-center rounded-xl border bg-white border-[#dfdad2] text-[#656c70] hover:border-[#d2ad76] transition-colors"
                    aria-label="View product">
                    <ChevronRight size={15} />
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="px-4 py-4 border-t border-[#e5e1da] flex items-center justify-between gap-4">
            <span className="text-xs text-muted">Showing {from}–{to} of {total.toLocaleString('en-IN')}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => loadProducts(page - 1)}
                className="pill disabled:opacity-40 disabled:cursor-not-allowed">← Prev</button>
              <button disabled={page >= pages} onClick={() => loadProducts(page + 1)}
                className="pill disabled:opacity-40 disabled:cursor-not-allowed">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      <div className={cn('toast', toast ? 'show' : '')}>{toast}</div>
    </div>
  );
}
