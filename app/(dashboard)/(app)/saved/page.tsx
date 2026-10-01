import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getBrandBg, cn } from '@/lib/utils';

export default async function SavedProductsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: favorites } = await supabase
    .from('favorites')
    .select(`
      id,
      product_id,
      products ( id, brand, name, category, subcategory, description, initials )
    `)
    .eq('owner_id', user!.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Saved Products</h1>
        <p className="text-sm text-muted mt-0.5">{favorites?.length || 0} saved products</p>
      </div>

      <div className="panel">
        {!favorites?.length ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">⭐</div>
            <div className="text-muted text-sm mb-4">No saved products yet.</div>
            <Link href="/products"
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl font-bold text-sm text-white"
              style={{ background: '#d2ad76' }}>
              Browse Products
            </Link>
          </div>
        ) : (
          favorites.map((fav) => {
            const p = fav.products as any;
            if (!p) return null;
            return (
              <Link key={fav.id} href={`/products/${p.id}`} className="product-row">
                <div className={cn('prod-art w-[54px] h-[54px] text-sm', getBrandBg(p.brand))}>
                  {p.initials || p.name?.substring(0, 2)}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm">{p.name}</div>
                  <div className="text-xs text-muted mt-0.5">{p.brand} · {p.category} · {p.subcategory}</div>
                  <div className="text-xs text-muted mt-1 line-clamp-1">{p.description}</div>
                </div>
                <ChevronRight size={16} className="text-muted shrink-0" />
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
