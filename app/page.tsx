import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (url && url.startsWith('http') && !url.includes('placeholder')) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        redirect('/dashboard');
      }
    } catch {
      // Fall through to /login
    }
  }

  redirect('/login');
}
