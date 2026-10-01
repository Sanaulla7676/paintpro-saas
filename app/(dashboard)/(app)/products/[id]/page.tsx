import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBrandBg, formatINR, formatNumber } from '@/lib/utils';
import { ChevronLeft, Star, Plus, Package } from 'lucide-react';
import { AddToQuoteButton } from '@/components/products/AddToQuoteButton';
import { FavoriteButton } from '@/components/products/FavoriteButton';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: product } = await supabase.from('products').select('*').eq('id', id).single();
  if (!product) notFound();

  // Get prices
  const { data: prices } = await supabase.from('product_prices').select('*').eq('product_id', id);

  // Check favorite
  let isFavorite = false;
  if (user) {
    const { data: fav } = await supabase.from('favorites')
      .select('id').eq('owner_id', user.id).eq('product_id', id).single();
    isFavorite = !!fav;
  }

  const features = [
    { label: 'Brand', value: product.brand },
    { label: 'Category', value: product.category },
    { label: 'Sub-category', value: product.subcategory },
    { label: 'Finish', value: product.finish || '—' },
    { label: 'Application', value: product.application || '—' },
    { label: 'Coverage', value: product.coverage ? `${formatNumber(product.coverage)} sq.ft/unit` : '—' },
    { label: 'Recommended Coats', value: product.recommended_coats ? `${product.recommended_coats} coats` : '—' },
    { label: 'Product Code', value: product.product_code || '—' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted">
        <Link href="/products" className="hover:text-ink flex items-center gap-1">
          <ChevronLeft size={13} /> Products
        </Link>
        <span>/</span>
        <span className="text-ink font-medium truncate">{product.name}</span>
      </div>

      {/* Hero */}
      <div className="panel overflow-visible">
        <div className="grid md:grid-cols-[220px_1fr] gap-0">
          {/* Artwork */}
          <div className={`${getBrandBg(product.brand)} rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none flex items-center justify-center min-h-[200px]`}>
            <div className="text-white text-6xl font-black opacity-80">
              {product.initials || product.name.substring(0, 2)}
            </div>
          </div>

          {/* Info */}
          <div className="p-6">
            <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8b652e' }}>
              {product.brand} · {product.category}
            </div>
            <h1 className="text-2xl font-black tracking-tight mb-3">{product.name}</h1>
            <p className="text-[#6d7478] leading-relaxed text-sm mb-5">{product.description}</p>

            {/* Price */}
            {prices && prices.length > 0 ? (
              <div className="flex flex-wrap gap-3 mb-5">
                {prices.map((price) => (
                  <div key={price.id} className="border border-[#e5e1da] rounded-xl px-4 py-2 text-sm">
                    <div className="text-xs text-muted">{price.pack_size}</div>
                    <div className="font-black text-base">{formatINR(price.working_price)}</div>
                    {price.mrp && price.mrp > price.working_price && (
                      <div className="text-xs text-muted line-through">{formatINR(price.mrp)} MRP</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mb-5 text-sm text-muted border border-dashed border-[#d9d4cd] rounded-xl px-4 py-3">
                Working price not set — <Link href="/price-book" className="font-semibold" style={{ color: '#8b652e' }}>Add to Price Book</Link>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              <FavoriteButton productId={id} isFavorite={isFavorite} />
              <AddToQuoteButton product={product} />
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="panel">
        <div className="panel-head">
          <h2 className="text-base font-bold">Technical Details</h2>
        </div>
        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {features.map((f) => (
            <div key={f.label} className="bg-white border border-[#e5e1da] rounded-2xl p-4">
              <div className="text-[9px] uppercase tracking-widest text-muted font-black mb-1">{f.label}</div>
              <div className="text-sm font-bold">{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pack Sizes */}
      {product.pack_sizes && product.pack_sizes.length > 0 && (
        <div className="panel">
          <div className="panel-head"><h2 className="text-base font-bold">Available Pack Sizes</h2></div>
          <div className="p-5 flex flex-wrap gap-2">
            {product.pack_sizes.map((size: string) => (
              <span key={size} className="px-3 py-1.5 bg-[#f4ead9] text-[#8b652e] rounded-xl text-sm font-bold border border-[#e6d0a9]">
                {size}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
