'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Eye, Edit, Copy, Trash2, FileDown } from 'lucide-react';

interface QuotationActionsProps {
  quotationId: string;
  quotationNumber: string;
}

export function QuotationActions({ quotationId, quotationNumber }: QuotationActionsProps) {
  const router = useRouter();
  const supabase = createClient();
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    if (!confirming) { setConfirming(true); return; }
    await supabase.from('quotations').delete().eq('id', quotationId);
    router.refresh();
  }

  async function handleDuplicate() {
    const { data: original } = await supabase.from('quotations').select('*').eq('id', quotationId).single();
    if (!original) return;
    const newNumber = `${original.quotation_number}-COPY-${Date.now().toString().slice(-4)}`;
    await supabase.from('quotations').insert({
      ...original,
      id: undefined,
      quotation_number: newNumber,
      status: 'Draft',
      created_at: undefined,
      updated_at: undefined,
    });
    router.refresh();
  }

  return (
    <div className="flex gap-1">
      <Link href={`/quotations/${quotationNumber}`}
        className="w-7 h-7 rounded-lg border border-[#dfdad2] bg-white flex items-center justify-center text-muted hover:text-ink hover:border-[#d2ad76] transition-colors"
        title="View">
        <Eye size={12} />
      </Link>
      <Link href={`/quotations/${quotationNumber}/edit`}
        className="w-7 h-7 rounded-lg border border-[#dfdad2] bg-white flex items-center justify-center text-muted hover:text-ink hover:border-[#d2ad76] transition-colors"
        title="Edit">
        <Edit size={12} />
      </Link>
      <button onClick={handleDuplicate}
        className="w-7 h-7 rounded-lg border border-[#dfdad2] bg-white flex items-center justify-center text-muted hover:text-ink hover:border-[#d2ad76] transition-colors"
        title="Duplicate">
        <Copy size={12} />
      </button>
      <button onClick={handleDelete}
        className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors ${confirming ? 'bg-red-500 border-red-500 text-white' : 'border-[#dfdad2] bg-white text-muted hover:text-red-500 hover:border-red-200'}`}
        title={confirming ? 'Click again to confirm delete' : 'Delete'}>
        <Trash2 size={12} />
      </button>
    </div>
  );
}
