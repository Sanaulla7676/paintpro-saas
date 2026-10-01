'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Edit, Trash2 } from 'lucide-react';

export function CustomerActions({ customerId }: { customerId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    if (!confirming) { setConfirming(true); return; }
    await supabase.from('customers').delete().eq('id', customerId);
    router.refresh();
  }

  return (
    <div className="flex gap-1">
      <Link href={`/customers/${customerId}/edit`}
        className="w-7 h-7 rounded-lg border border-[#dfdad2] bg-white flex items-center justify-center text-muted hover:border-[#d2ad76] transition-colors">
        <Edit size={12} />
      </Link>
      <button onClick={handleDelete}
        className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors ${confirming ? 'bg-red-500 border-red-500 text-white' : 'border-[#dfdad2] bg-white text-muted hover:text-red-500 hover:border-red-200'}`}
        title={confirming ? 'Confirm delete' : 'Delete'}>
        <Trash2 size={12} />
      </button>
    </div>
  );
}
