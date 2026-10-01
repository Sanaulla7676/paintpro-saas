'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useQuotationStore } from '@/hooks/useQuotationStore';
import type { Product } from '@/types/catalog';

export function AddToQuoteButton({ product }: { product: Product }) {
  const router = useRouter();
  const { addProduct } = useQuotationStore();

  function handleAdd() {
    addProduct(product);
    router.push('/quotations/new');
  }

  return (
    <button
      onClick={handleAdd}
      className="h-11 px-4 rounded-2xl font-bold text-sm flex items-center gap-2 text-white transition-opacity hover:opacity-90"
      style={{ background: 'linear-gradient(135deg,#2b3236,#1f2528)' }}
    >
      <Plus size={15} /> Add to Quote
    </button>
  );
}
