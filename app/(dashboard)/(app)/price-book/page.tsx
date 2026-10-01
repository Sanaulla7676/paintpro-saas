import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PriceBookClient } from '@/components/price-book/PriceBookClient';

export default async function PriceBookPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch all products with their current prices
  const { data: products } = await supabase
    .from('products')
    .select(`
      id, brand, name, category, subcategory, description, initials, pack_sizes,
      product_prices ( id, pack_size, unit, mrp, working_price, dealer_price )
    `)
    .eq('active', true)
    .order('brand').order('category').order('name');

  return (
    <PriceBookClient products={products || []} />
  );
}
