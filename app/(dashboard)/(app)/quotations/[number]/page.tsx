import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { formatINR, formatDate, formatNumber } from '@/lib/utils';
import { QuotationStatusBadge } from '@/components/quotation/QuotationStatusBadge';
import Link from 'next/link';
import { Edit, Printer, Share2, ChevronLeft } from 'lucide-react';
import { PrintQuotation } from '@/components/quotation/PrintQuotation';

interface QuotationViewProps {
  params: Promise<{ number: string }>;
}

export default async function QuotationViewPage({ params }: QuotationViewProps) {
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

  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user!.id).single();

  const rooms = JSON.parse(q.rooms_json || '[]');
  const items = JSON.parse(q.items_json || '[]');

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <Link href="/quotations" className="flex items-center gap-1 text-sm text-muted hover:text-ink">
          <ChevronLeft size={15} /> Quotations
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black">{q.quotation_number}</h1>
            <QuotationStatusBadge status={q.status} />
          </div>
          <p className="text-sm text-muted">{formatDate(q.quotation_date)} · Valid until {formatDate(q.valid_until)}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/quotations/${encodeURIComponent(q.quotation_number)}/edit`}
            className="h-10 px-4 rounded-xl font-bold text-sm border border-[#d9d4cd] bg-white flex items-center gap-1.5">
            <Edit size={14} /> Edit
          </Link>
          <PrintQuotation quotation={q} profile={profile} rooms={rooms} items={items} />
        </div>
      </div>

      {/* Quotation Preview */}
      <div className="panel">
        {/* Company Header */}
        <div className="p-6 border-b border-[#e5e1da] flex justify-between items-start gap-6 bg-gradient-to-r from-[#1f2528] to-[#2b3236] text-white rounded-t-3xl">
          <div>
            <div className="text-2xl font-black">
              {profile?.company_name || 'PAINT'}
              <span style={{ color: '#d2ad76' }}>{profile?.company_name ? '' : 'PRO'}</span>
            </div>
            <div className="text-[9px] text-[#aeb5b8] uppercase tracking-widest mt-0.5">Premium Painter Quotation</div>
            {profile?.phone && <div className="text-sm text-[#cdd2d4] mt-2">📞 {profile.phone}</div>}
            {profile?.email && <div className="text-sm text-[#cdd2d4]">✉ {profile.email}</div>}
          </div>
          <div className="text-right text-sm">
            <div className="font-black text-lg">{q.quotation_number}</div>
            <div className="text-[#cdd2d4] text-xs mt-1">Date: {formatDate(q.quotation_date)}</div>
            <div className="text-[#cdd2d4] text-xs">Valid: {formatDate(q.valid_until)}</div>
          </div>
        </div>

        {/* Client + Project */}
        <div className="grid sm:grid-cols-2 gap-0 border-b border-[#e5e1da]">
          <div className="p-5 border-r border-[#e5e1da]">
            <div className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">Client</div>
            <div className="font-bold">{q.customer_name || '—'}</div>
            {q.customer_phone && <div className="text-sm text-muted">{q.customer_phone}</div>}
            {q.customer_email && <div className="text-sm text-muted">{q.customer_email}</div>}
            {q.customer_city && <div className="text-sm text-muted">{q.customer_city}</div>}
          </div>
          <div className="p-5">
            <div className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">Project</div>
            <div className="font-bold">{q.project_name || q.site_address || '—'}</div>
            {q.site_address && q.project_name && <div className="text-sm text-muted">{q.site_address}</div>}
            {q.property_type && <div className="text-sm text-muted">{q.property_type} · {q.project_type}</div>}
            {q.floors && <div className="text-sm text-muted">{q.floors} floor(s)</div>}
          </div>
        </div>

        {/* Rooms Table */}
        {rooms.length > 0 && (
          <div className="p-5 border-b border-[#e5e1da]">
            <div className="text-[10px] font-black uppercase tracking-widest text-muted mb-3">Measurement Summary</div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f7f4ef]">
                    {['Room / Zone','Type','Zone','Condition','Dimensions (L×W×H)','Walls sq.ft','Ceiling sq.ft','Total sq.ft'].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-[9px] font-black uppercase tracking-wider text-muted border border-[#e5e1da]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((r: any, i: number) => {
                    const walls = Math.max(0, 2 * (r.length_ft + r.width_ft) * r.height_ft - r.openings_sqft);
                    const ceil = r.length_ft * r.width_ft;
                    return (
                      <tr key={i} className="even:bg-[#fdfcf9]">
                        <td className="px-3 py-2 font-bold border border-[#e5e1da]">{r.name}</td>
                        <td className="px-3 py-2 border border-[#e5e1da]">{r.room_type}</td>
                        <td className="px-3 py-2 border border-[#e5e1da]">{r.zone}</td>
                        <td className="px-3 py-2 border border-[#e5e1da]">{r.surface_condition}</td>
                        <td className="px-3 py-2 border border-[#e5e1da]">{r.length_ft}×{r.width_ft}×{r.height_ft} ft</td>
                        <td className="px-3 py-2 text-right border border-[#e5e1da]">{formatNumber(walls, 0)}</td>
                        <td className="px-3 py-2 text-right border border-[#e5e1da]">{formatNumber(ceil, 0)}</td>
                        <td className="px-3 py-2 text-right font-bold border border-[#e5e1da]">{formatNumber(walls + ceil, 0)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Scope Table */}
        {items.length > 0 && (
          <div className="p-5 border-b border-[#e5e1da]">
            <div className="text-[10px] font-black uppercase tracking-widest text-muted mb-3">Work Scope & Estimate</div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f7f4ef]">
                    {['#','Description','Room','Zone','Qty','Rate','Amount'].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-[9px] font-black uppercase tracking-wider text-muted border border-[#e5e1da]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any, i: number) => (
                    <tr key={i} className="even:bg-[#fdfcf9]">
                      <td className="px-3 py-2 text-muted border border-[#e5e1da]">{i + 1}</td>
                      <td className="px-3 py-2 font-medium border border-[#e5e1da]">{item.product_name || item.description || item.work_type}</td>
                      <td className="px-3 py-2 border border-[#e5e1da]">{item.room_name || 'Project'}</td>
                      <td className="px-3 py-2 border border-[#e5e1da]">{item.zone}</td>
                      <td className="px-3 py-2 text-right border border-[#e5e1da]">{formatNumber(item.quantity, 2)} {item.unit}</td>
                      <td className="px-3 py-2 text-right border border-[#e5e1da]">{formatINR(item.rate)}</td>
                      <td className="px-3 py-2 text-right font-bold border border-[#e5e1da]">{formatINR(item.quantity * item.rate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="p-5 border-b border-[#e5e1da]">
          <div className="ml-auto max-w-xs space-y-2">
            {[
              { label: 'Subtotal', value: q.subtotal },
              { label: `Discount (${q.discount_percent}%)`, value: q.discount_amount, negative: true },
              { label: 'Taxable Amount', value: q.taxable_amount },
              { label: `GST (${q.gst_percent}%)`, value: q.gst_amount },
            ].map((row) => (
              <div key={row.label} className="flex justify-between text-sm">
                <span className="text-muted">{row.label}</span>
                <span>{row.negative ? '-' : ''}{formatINR(row.value)}</span>
              </div>
            ))}
            <div className="flex justify-between font-black text-lg pt-3 border-t-2 border-[#e5e1da]"
              style={{ borderTopColor: '#d2ad76' }}>
              <span>Grand Total</span>
              <span style={{ color: '#b78b45' }}>{formatINR(q.grand_total)}</span>
            </div>
            {q.advance_percent > 0 && (
              <>
                <div className="flex justify-between text-sm text-muted">
                  <span>Advance ({q.advance_percent}%)</span>
                  <span className="font-bold text-ink">{formatINR(q.advance_amount)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted">
                  <span>Balance Due</span>
                  <span className="font-bold text-ink">{formatINR(q.balance_amount)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Terms */}
        {q.terms && (
          <div className="p-5 border-b border-[#e5e1da]">
            <div className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">Terms & Conditions</div>
            <p className="text-xs text-muted whitespace-pre-wrap leading-relaxed">{q.terms}</p>
          </div>
        )}

        {/* Signature */}
        <div className="p-5 flex justify-between items-end text-xs text-muted">
          <div>
            <div className="font-bold text-ink mb-1">Prepared by</div>
            <div>{profile?.full_name || 'Painter'}</div>
            {profile?.company_name && <div>{profile.company_name}</div>}
          </div>
          <div className="text-right">
            <div className="font-bold text-ink mb-1">Client Acceptance</div>
            <div className="w-40 border-b-2 border-[#d0cbc3] pt-8 text-center">Signature</div>
          </div>
        </div>
      </div>
    </div>
  );
}
