import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { FileText, Users, Package, BookOpen, Plus, TrendingUp } from 'lucide-react';
import { formatINR, formatDate } from '@/lib/utils';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Parallel data fetch
  const [
    { data: profile },
    { count: totalQuotes },
    { count: draftQuotes },
    { count: sentQuotes },
    { count: acceptedQuotes },
    { count: totalCustomers },
    { count: totalProducts },
    { data: recentQuotes },
    { data: recentCustomers },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('quotations').select('*', { count: 'exact', head: true }).eq('owner_id', user.id),
    supabase.from('quotations').select('*', { count: 'exact', head: true }).eq('owner_id', user.id).eq('status', 'Draft'),
    supabase.from('quotations').select('*', { count: 'exact', head: true }).eq('owner_id', user.id).eq('status', 'Sent'),
    supabase.from('quotations').select('*', { count: 'exact', head: true }).eq('owner_id', user.id).eq('status', 'Accepted'),
    supabase.from('customers').select('*', { count: 'exact', head: true }).eq('owner_id', user.id),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('quotations').select('quotation_number,quotation_date,customer_name,status,grand_total').eq('owner_id', user.id).order('created_at', { ascending: false }).limit(6),
    supabase.from('customers').select('id,name,phone,city,created_at').eq('owner_id', user.id).order('created_at', { ascending: false }).limit(5),
  ]);

  const metrics = [
    { label: 'Total Quotes', value: totalQuotes || 0, icon: <FileText size={18} />, color: 'text-blue-600' },
    { label: 'Draft', value: draftQuotes || 0, icon: <FileText size={18} />, color: 'text-amber-600' },
    { label: 'Sent', value: sentQuotes || 0, icon: <TrendingUp size={18} />, color: 'text-purple-600' },
    { label: 'Accepted', value: acceptedQuotes || 0, icon: <TrendingUp size={18} />, color: 'text-green-600' },
    { label: 'Customers', value: totalCustomers || 0, icon: <Users size={18} />, color: 'text-rose-600' },
    { label: 'Products in Catalog', value: totalProducts || 0, icon: <Package size={18} />, color: 'text-gold-dark' },
  ];

  const statusColors: Record<string, string> = {
    Draft: 'bg-amber-50 text-amber-700 border-amber-200',
    Sent: 'bg-blue-50 text-blue-700 border-blue-200',
    Accepted: 'bg-green-50 text-green-700 border-green-200',
    Rejected: 'bg-red-50 text-red-700 border-red-200',
    Expired: 'bg-gray-50 text-gray-600 border-gray-200',
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="rounded-[30px] text-white px-8 py-8 flex items-center justify-between gap-6"
        style={{ background: 'linear-gradient(135deg,#202629,#343b3f)', boxShadow: '0 18px 44px rgba(31,37,40,.09)' }}>
        <div>
          <div className="inline-flex items-center px-3 py-1.5 border border-white/20 rounded-full bg-white/5 text-[#d9c4a1] text-[9px] font-black uppercase tracking-widest mb-4">
            ● Premium Quotation Workflow
          </div>
          <h1 className="text-3xl font-black tracking-tight leading-tight mb-3">
            Measure. Scope. Quote.
          </h1>
          <p className="text-[#cdd2d4] text-sm leading-relaxed max-w-xl">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}! Build room-by-room measurements, select products from {totalProducts || 259} catalog items across 3 brands, and issue premium client quotations.
          </p>
        </div>
        <div className="hidden md:flex flex-col gap-3 shrink-0">
          <Link href="/quotations/new"
            className="h-11 px-5 rounded-2xl font-bold text-[#1f2528] flex items-center gap-2 text-sm whitespace-nowrap"
            style={{ background: '#d2ad76' }}>
            <Plus size={16} /> New Quotation
          </Link>
          <Link href="/products"
            className="h-11 px-5 rounded-2xl font-bold border border-white/20 text-white flex items-center gap-2 text-sm bg-transparent">
            <Package size={16} /> Browse Catalog
          </Link>
        </div>
      </section>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white border border-[#e5e1da] rounded-3xl p-4"
            style={{ boxShadow: '0 18px 44px rgba(31,37,40,.09)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className={m.color}>{m.icon}</span>
              <span className="text-[10px] text-[#8d9396] uppercase tracking-widest font-bold">{m.label}</span>
            </div>
            <div className="text-2xl font-black tracking-tight">{m.value.toLocaleString('en-IN')}</div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Quotations */}
        <div className="lg:col-span-2 panel">
          <div className="panel-head">
            <h2 className="text-base font-bold">Recent Quotations</h2>
            <Link href="/quotations" className="text-sm font-semibold" style={{ color: '#8b652e' }}>View all →</Link>
          </div>
          <div>
            {!recentQuotes?.length ? (
              <div className="px-5 py-10 text-center text-muted text-sm">
                No quotations yet.{' '}
                <Link href="/quotations/new" className="font-semibold" style={{ color: '#8b652e' }}>Create your first →</Link>
              </div>
            ) : (
              recentQuotes.map((q) => (
                <Link key={q.quotation_number} href={`/quotations/${q.quotation_number}`}
                  className="product-row group">
                  <div className="prod-art brand-berger w-12 h-12 text-sm">
                    {q.quotation_number?.split('-').pop()?.slice(-3)}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{q.quotation_number}</div>
                    <div className="text-xs text-muted mt-0.5">
                      {q.customer_name || 'Customer'} · {formatDate(q.quotation_date)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 rounded-full text-[9px] font-black border ${statusColors[q.status] || statusColors.Draft}`}>
                      {q.status}
                    </span>
                    <div className="text-sm font-black mt-1">{formatINR(q.grand_total)}</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="panel">
            <div className="panel-head">
              <h2 className="text-base font-bold">Quick Actions</h2>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {[
                { href: '/quotations/new', label: 'New Quote', icon: <FileText size={16} />, bg: '#d2ad76', color: 'white' },
                { href: '/products', label: 'Products', icon: <Package size={16} />, bg: '#1f2528', color: 'white' },
                { href: '/customers/new', label: 'Add Customer', icon: <Users size={16} />, bg: '#f4ead9', color: '#8b652e' },
                { href: '/price-book', label: 'Price Book', icon: <BookOpen size={16} />, bg: '#f4ead9', color: '#8b652e' },
              ].map((a) => (
                <Link key={a.href} href={a.href}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl text-xs font-bold text-center transition-opacity hover:opacity-80"
                  style={{ background: a.bg, color: a.color }}>
                  {a.icon}
                  {a.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Customers */}
          <div className="panel">
            <div className="panel-head">
              <h2 className="text-base font-bold">Recent Customers</h2>
              <Link href="/customers" className="text-sm font-semibold" style={{ color: '#8b652e' }}>All →</Link>
            </div>
            <div>
              {!recentCustomers?.length ? (
                <div className="px-5 py-6 text-center text-muted text-sm">No customers yet</div>
              ) : (
                recentCustomers.map((c) => (
                  <Link key={c.id} href={`/customers/${c.id}`}
                    className="flex items-center gap-3 px-4 py-3 border-t border-[#e5e1da] first:border-t-0 hover:bg-[#fdfcf9] transition-colors">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0"
                      style={{ background: 'linear-gradient(145deg,#d2ad76,#b78b45)' }}>
                      {c.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate">{c.name}</div>
                      <div className="text-xs text-muted">{c.city || c.phone || 'No details'}</div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
