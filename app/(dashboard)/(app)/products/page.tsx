import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { ProductsClient } from '@/components/products/ProductsClient';

interface ProductsPageProps {
  searchParams: Promise<{ q?: string; brand?: string; category?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Server-side initial fetch
  let query = supabase.from('products').select('*', { count: 'exact' }).eq('active', true);

  if (params.brand && params.brand !== 'All Brands') query = query.eq('brand', params.brand);
  if (params.category) query = query.eq('category', params.category);
  if (params.q) {
    query = query.or(
      `name.ilike.%${params.q}%,brand.ilike.%${params.q}%,category.ilike.%${params.q}%,description.ilike.%${params.q}%`
    );
  }

  const { data: products, count } = await query
    .order('brand').order('category').order('name')
    .range(0, 17);

  // Fetch user favorites
  let favorites: string[] = [];
  if (user) {
    const { data: favData } = await supabase
      .from('favorites')
      .select('product_id')
      .eq('owner_id', user.id);
    favorites = favData?.map((f) => f.product_id) || [];
  }

  return (
    <Suspense fallback={<div className="p-8 text-center text-muted">Loading products catalog…</div>}>
      <ProductsClient
        initialProducts={products || []}
        totalCount={count || 0}
        favorites={favorites}
      />
    </Suspense>
  );
}

