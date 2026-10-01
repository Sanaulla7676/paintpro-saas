import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { formatINR, formatDate } from '@/lib/utils';
import { Plus, FileText, Eye } from 'lucide-react';
import { QuotationStatusBadge } from '@/components/quotation/QuotationStatusBadge';
import { QuotationActions } from '@/components/quotation/QuotationActions';

interface QuotationsPageProps {
  searchParams: Promise<{ q?: string; status?: string }>;
}

export default async function QuotationsPage({ searchParams }: QuotationsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from('quotations')
    .select('*')
    .eq('owner_id', user!.id)
    .order('created_at', { ascending: false });

  if (params.status) query = query.eq('status', params.status);
  if (params.q) {
    query = query.or(
      `quotation_number.ilike.%${params.q}%,customer_name.ilike.%${params.q}%,project_name.ilike.%${params.q}%`
    );
  }

  const { data: quotations } = await query.limit(50);

  const statuses = ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Quotations</h1>
          <p className="text-sm text-muted mt-0.5">{quotations?.length || 0} quotations</p>
        </div>
        <Link href="/quotations/new"
          className="h-11 px-5 rounded-2xl font-bold text-sm text-white flex items-center gap-2"
          style={{ background: '#d2ad76' }}>
          <Plus size={16} /> New Quotation
        </Link>
      </div>

      {/* Filters */}
      <div className="panel">
        <div className="p-4 flex flex-col sm:flex-row gap-3 border-b border-[#e5e1da]">
          <form className="flex-1">
            <input
              type="search"
              name="q"
              defaultValue={params.q}
              placeholder="Search by number, customer, project…"
              className="w-full h-10 border border-[#d9d4cd] rounded-xl px-4 text-sm outline-none focus:border-[#c19b62]"
            />
          </form>
          <div className="flex gap-2 overflow-x-auto">
            <Link href="/quotations"
              className={`pill whitespace-nowrap ${!params.status ? 'active' : ''}`}>
              All
            </Link>
            {statuses.map((s) => (
              <Link key={s} href={`/quotations?status=${s}`}
                className={`pill whitespace-nowrap ${params.status === s ? 'active' : ''}`}>
                {s}
              </Link>
            ))}
          </div>
        </div>

        {/* List */}
        <div>
          {!quotations?.length ? (
            <div className="py-16 text-center">
              <FileText size={40} className="mx-auto text-[#d0cbc3] mb-4" />
              <div className="text-muted text-sm mb-4">No quotations yet.</div>
              <Link href="/quotations/new"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl font-bold text-sm text-white"
                style={{ background: '#d2ad76' }}>
                <Plus size={15} /> Create your first quotation
              </Link>
            </div>
          ) : (
            quotations.map((q) => (
              <div key={q.id} className="product-row">
                <div className="prod-art w-[54px] h-[54px] text-sm brand-berger">
                  {q.quotation_number?.slice(-3)}
                </div>
                <div className="min-w-0">
                  <div className="font-black text-sm">{q.quotation_number}</div>
                  <div className="text-xs text-muted mt-0.5 truncate">
                    {q.customer_name || 'No customer'} · {q.project_name || q.customer_city || 'No project'}
                  </div>
                  <div className="text-xs text-muted mt-0.5">{formatDate(q.quotation_date)}</div>
                </div>
                <div className="text-right flex flex-col items-end gap-1.5">
                  <QuotationStatusBadge status={q.status} />
                  <div className="font-black text-sm">{formatINR(q.grand_total)}</div>
                  <QuotationActions quotationId={q.id} quotationNumber={q.quotation_number} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
