import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ChevronRight, Layers, Package } from 'lucide-react';

export default async function CategoriesPage() {
  const supabase = await createClient();

  // Fetch all active products' categories to calculate counts
  const { data: products } = await supabase
    .from('products')
    .select('category, brand')
    .eq('active', true);

  const categoryMap = new Map<string, { total: number; brands: Set<string> }>();

  if (products && products.length > 0) {
    for (const p of products) {
      const cat = p.category || 'Other';
      const existing = categoryMap.get(cat) || { total: 0, brands: new Set<string>() };
      existing.total += 1;
      if (p.brand) existing.brands.add(p.brand);
      categoryMap.set(cat, existing);
    }
  }

  const sortedCategories = Array.from(categoryMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="crumb">
        <Link href="/products" className="hover:underline">Catalog</Link>
        <span>›</span>
        <span>Categories</span>
      </div>

      <section className="panel">
        <div className="panel-head flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black">Product Categories</h1>
            <p className="text-xs text-muted mt-0.5">Explore paints, primers, finishes, and waterproofing by category</p>
          </div>
          <span className="text-xs font-bold text-muted bg-[#f2eee9] px-3 py-1.5 rounded-xl">
            {sortedCategories.length} categories
          </span>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedCategories.map(([categoryName, stats]) => (
              <Link
                key={categoryName}
                href={`/products?category=${encodeURIComponent(categoryName)}`}
                className="flex items-center gap-3.5 p-4 rounded-2xl border border-[#e5e1da] bg-[#faf8f5] hover:bg-white hover:border-[#d2ad76] hover:shadow-soft transition-all group"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                  style={{ background: 'linear-gradient(135deg,#2b3236,#1f2528)' }}
                >
                  <Layers size={18} className="text-[#d2ad76]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-ink group-hover:text-[#b78b45] transition-colors truncate">
                    {categoryName}
                  </div>
                  <div className="text-xs text-muted mt-0.5 flex items-center gap-1.5">
                    <Package size={12} />
                    <span>{stats.total} products</span>
                    <span>·</span>
                    <span>{stats.brands.size} brands</span>
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="text-muted group-hover:text-ink group-hover:translate-x-0.5 transition-all shrink-0"
                />
              </Link>
            ))}
          </div>

          {sortedCategories.length === 0 && (
            <div className="text-center py-16 text-muted text-sm">
              No categories found. Run database catalog seeds to populate.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
