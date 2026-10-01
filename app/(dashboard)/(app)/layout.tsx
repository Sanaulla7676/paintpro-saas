import { createClient } from '@/lib/supabase/server';
import { Topbar } from '@/components/layout/Topbar';
import { Sidebar, MobileNav } from '@/components/layout/Sidebar';

export default async function AppShellLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile: { full_name?: string; company_name?: string } = {};
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, company_name')
      .eq('user_id', user.id)
      .single();
    profile = data || {};
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar fullName={profile.full_name} companyName={profile.company_name} />
      <div className="flex flex-1">
        <Sidebar fullName={profile.full_name} companyName={profile.company_name} />
        <main className="flex-1 max-w-[1540px] mx-auto px-6 py-8 pb-24 lg:pb-8 w-full">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
