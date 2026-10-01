'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function NewCustomerPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '', city: '', notes: '',
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Customer name is required'); return; }
    setError('');
    startTransition(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error: err } = await supabase.from('customers').insert({
        owner_id: user.id,
        ...form,
      });
      if (err) { setError(err.message); return; }
      router.push('/customers');
      router.refresh();
    });
  }

  return (
    <div className="max-w-xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/customers" className="flex items-center gap-1 text-sm text-muted hover:text-ink">
          <ChevronLeft size={15} /> Customers
        </Link>
        <h1 className="text-xl font-black">Add Customer</h1>
      </div>

      <div className="panel">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>
          )}

          <div className="field">
            <label>Full Name *</label>
            <input required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Customer full name" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="field">
              <label>Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="Mobile number" />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="email@example.com" />
            </div>
          </div>
          <div className="field">
            <label>Address</label>
            <input value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Full address" />
          </div>
          <div className="field">
            <label>City</label>
            <input value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="City" />
          </div>
          <div className="field">
            <label>Notes</label>
            <textarea rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Any additional notes about this customer…" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isPending}
              className="h-11 px-6 rounded-2xl font-bold text-sm text-white"
              style={{ background: isPending ? '#999' : '#1f2528' }}>
              {isPending ? 'Saving…' : 'Save Customer'}
            </button>
            <Link href="/customers"
              className="h-11 px-6 rounded-2xl font-bold text-sm border border-[#d9d4cd] bg-white flex items-center">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
