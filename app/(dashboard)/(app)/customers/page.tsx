import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { formatINR } from '@/lib/utils';
import { Plus, Phone, Mail, MapPin, FileText } from 'lucide-react';
import { CustomerActions } from '@/components/customers/CustomerActions';

interface CustomersPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from('customers')
    .select('*')
    .eq('owner_id', user!.id)
    .order('created_at', { ascending: false });

  if (params.q) {
    query = query.or(`name.ilike.%${params.q}%,phone.ilike.%${params.q}%,city.ilike.%${params.q}%`);
  }

  const { data: customers } = await query.limit(100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Customers</h1>
          <p className="text-sm text-muted mt-0.5">{customers?.length || 0} customers</p>
        </div>
        <Link href="/customers/new"
          className="h-11 px-5 rounded-2xl font-bold text-sm text-white flex items-center gap-2"
          style={{ background: '#d2ad76' }}>
          <Plus size={16} /> Add Customer
        </Link>
      </div>

      <div className="panel">
        {/* Search */}
        <div className="p-4 border-b border-[#e5e1da]">
          <form>
            <input
              type="search"
              name="q"
              defaultValue={params.q}
              placeholder="Search by name, phone, city…"
              className="w-full h-10 border border-[#d9d4cd] rounded-xl px-4 text-sm outline-none focus:border-[#c19b62]"
            />
          </form>
        </div>

        {/* List */}
        {!customers?.length ? (
          <div className="py-16 text-center">
            <div className="text-muted text-sm mb-4">No customers yet.</div>
            <Link href="/customers/new"
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl font-bold text-sm text-white"
              style={{ background: '#d2ad76' }}>
              <Plus size={15} /> Add your first customer
            </Link>
          </div>
        ) : (
          customers.map((c) => (
            <div key={c.id} className="product-row">
              <div className="w-[54px] h-[54px] rounded-2xl flex items-center justify-center text-white font-black text-lg shrink-0"
                style={{ background: 'linear-gradient(145deg,#d2ad76,#b78b45)' }}>
                {c.name[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-black text-sm">{c.name}</div>
                <div className="flex flex-wrap gap-3 mt-1">
                  {c.phone && (
                    <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-xs text-muted hover:text-ink">
                      <Phone size={11} /> {c.phone}
                    </a>
                  )}
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="flex items-center gap-1 text-xs text-muted hover:text-ink">
                      <Mail size={11} /> {c.email}
                    </a>
                  )}
                  {c.city && (
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <MapPin size={11} /> {c.city}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Link href={`/quotations/new?customer=${c.id}`}
                  className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg"
                  style={{ background: '#f4ead9', color: '#8b652e' }}>
                  <FileText size={11} /> Quote
                </Link>
                <CustomerActions customerId={c.id} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
