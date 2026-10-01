import { createClient } from '@/lib/supabase/server';
import { ShadesClient } from '@/components/shades/ShadesClient';
import type { Shade } from '@/types/catalog';

export default async function ShadesPage() {
  const supabase = await createClient();

  const { data: dbShades } = await supabase
    .from('shades')
    .select('*')
    .eq('active', true)
    .order('name');

  return <ShadesClient initialShades={(dbShades as Shade[]) || []} />;
}
