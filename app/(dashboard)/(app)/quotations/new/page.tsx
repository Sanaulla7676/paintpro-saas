import { createClient } from '@/lib/supabase/server';
import { QuotationStudio } from '@/components/quotation/QuotationStudio';

export default async function NewQuotationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch all active products for the scope dropdown
  const { data: products } = await supabase
    .from('products')
    .select('id, brand, name, category, subcategory, description, coverage, recommended_coats, initials, working_price')
    .eq('active', true)
    .order('brand')
    .order('name');

  // Fetch profile defaults
  const { data: profile } = await supabase
    .from('profiles')
    .select('default_gst, default_advance, default_labour_interior, default_labour_exterior, default_terms, quotation_prefix')
    .eq('user_id', user!.id)
    .single();

  const profileDefaults = {
    gst_percent: profile?.default_gst ?? 18,
    advance_percent: profile?.default_advance ?? 30,
    labour_interior: profile?.default_labour_interior ?? 0,
    labour_exterior: profile?.default_labour_exterior ?? 0,
    terms: profile?.default_terms ?? 'Payment: 30% advance, balance on completion.\nScope includes material and labour as specified above.\nAny additional work beyond scope will be charged separately.',
    prefix: profile?.quotation_prefix ?? 'PP',
  };

  return (
    <QuotationStudio
      products={products || []}
      profileDefaults={profileDefaults}
    />
  );
}
