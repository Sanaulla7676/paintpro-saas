import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { QuotationStudio } from '@/components/quotation/QuotationStudio';
import type { Quotation } from '@/types/quotation';

interface EditQuotationPageProps {
  params: Promise<{ number: string }>;
}

export default async function EditQuotationPage({ params }: EditQuotationPageProps) {
  const { number } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: q } = await supabase
    .from('quotations')
    .select('*')
    .eq('owner_id', user!.id)
    .eq('quotation_number', decodeURIComponent(number))
    .single();

  if (!q) notFound();

  const { data: products } = await supabase
    .from('products')
    .select('id, brand, name, category, subcategory, description, coverage, recommended_coats, initials, working_price')
    .eq('active', true)
    .order('brand').order('name');

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_gst, default_advance, default_labour_interior, default_labour_exterior, default_terms, quotation_prefix')
    .eq('user_id', user!.id)
    .single();

  // Reconstruct the Quotation object from DB row
  const existingQuotation: Quotation = {
    id: q.id,
    owner_id: q.owner_id,
    quotation_number: q.quotation_number,
    quotation_date: q.quotation_date,
    valid_until: q.valid_until,
    customer_name: q.customer_name || '',
    customer_phone: q.customer_phone || '',
    customer_email: q.customer_email || '',
    customer_city: q.customer_city || '',
    site_address: q.site_address || '',
    project_name: q.project_name || '',
    property_type: q.property_type || 'Apartment',
    project_type: q.project_type || 'Residential',
    floors: q.floors || 1,
    subtotal: q.subtotal || 0,
    discount_percent: q.discount_percent || 0,
    discount_amount: q.discount_amount || 0,
    taxable_amount: q.taxable_amount || 0,
    gst_percent: q.gst_percent || 18,
    gst_amount: q.gst_amount || 0,
    grand_total: q.grand_total || 0,
    advance_percent: q.advance_percent || 0,
    advance_amount: q.advance_amount || 0,
    balance_amount: q.balance_amount || 0,
    labour_interior_rate: q.labour_interior_rate || 0,
    labour_exterior_rate: q.labour_exterior_rate || 0,
    status: q.status || 'Draft',
    terms: q.terms || '',
    notes: q.notes || '',
    rooms: JSON.parse(q.rooms_json || '[]'),
    items: JSON.parse(q.items_json || '[]'),
  };

  const profileDefaults = {
    gst_percent: profile?.default_gst ?? 18,
    advance_percent: profile?.default_advance ?? 30,
    labour_interior: profile?.default_labour_interior ?? 0,
    labour_exterior: profile?.default_labour_exterior ?? 0,
    terms: profile?.default_terms ?? '',
    prefix: profile?.quotation_prefix ?? 'PP',
  };

  return (
    <QuotationStudio
      quotationNumber={q.quotation_number}
      products={products || []}
      profileDefaults={profileDefaults}
      initialQuotation={existingQuotation}
    />
  );
}
