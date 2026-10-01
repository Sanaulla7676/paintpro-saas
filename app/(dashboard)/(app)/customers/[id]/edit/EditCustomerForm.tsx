'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface CustomerRecord {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  notes?: string | null;
}

export function EditCustomerForm({ customer }: { customer: CustomerRecord }) {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: customer.name || '',
    phone: customer.phone || '',
    email: customer.email || '',
    address: customer.address || '',
    city: customer.city || '',
    notes: customer.notes || '',
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Customer name is required'); return; }
    setError('');
    startTransition(async () => {
      const { error: err } = await supabase
        .from('customers')
        .update({
          name: form.name.trim(),
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
          address: form.address.trim() || null,
          city: form.city.trim() || null,
          notes: form.notes.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', customer.id);

      if (err) { setError(err.message); return; }
      router.push('/customers');
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>
      )}

      <div className="field">
        <label>Full Name *</label>
        <input
          required
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="Customer full name"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="field">
          <label>Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="Mobile number"
          />
        </div>
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="email@example.com"
          />
        </div>
      </div>
      <div className="field">
        <label>Address</label>
        <input
          value={form.address}
          onChange={(e) => set('address', e.target.value)}
          placeholder="Full address"
        />
      </div>
      <div className="field">
        <label>City</label>
        <input
          value={form.city}
          onChange={(e) => set('city', e.target.value)}
          placeholder="City"
        />
      </div>
      <div className="field">
        <label>Notes</label>
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Any additional notes about this customer…"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="h-11 px-6 rounded-2xl font-bold text-sm text-white"
          style={{ background: isPending ? '#999' : '#1f2528' }}
        >
          {isPending ? 'Saving…' : 'Update Customer'}
        </button>
        <Link
          href="/customers"
          className="h-11 px-6 rounded-2xl font-bold text-sm border border-[#d9d4cd] bg-white flex items-center"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
