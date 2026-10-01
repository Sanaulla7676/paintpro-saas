'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export function FavoriteButton({ productId, isFavorite: initial }: { productId: string; isFavorite: boolean }) {
  const [isFavorite, setIsFavorite] = useState(initial);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function toggle() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (isFavorite) {
      await supabase.from('favorites').delete().eq('owner_id', user.id).eq('product_id', productId);
      setIsFavorite(false);
    } else {
      await supabase.from('favorites').insert({ owner_id: user.id, product_id: productId });
      setIsFavorite(true);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        'h-11 px-4 rounded-2xl font-bold text-sm flex items-center gap-2 border transition-all',
        isFavorite
          ? 'bg-[#f4ead9] border-[#e5d0ab] text-[#87632e]'
          : 'bg-white border-[#d9d4cd] text-[#666d71] hover:border-[#d2ad76]'
      )}
    >
      <Star size={15} fill={isFavorite ? 'currentColor' : 'none'} />
      {isFavorite ? 'Saved' : 'Save Product'}
    </button>
  );
}
