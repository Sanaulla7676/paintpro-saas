import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { EditCustomerForm } from './EditCustomerForm';

interface EditCustomerPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCustomerPage({ params }: EditCustomerPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single();

  if (!customer) {
    notFound();
  }

  return (
    <div className="max-w-xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/customers" className="flex items-center gap-1 text-sm text-muted hover:text-ink">
          <ChevronLeft size={15} /> Customers
        </Link>
        <h1 className="text-xl font-black">Edit Customer</h1>
      </div>

      <div className="panel">
        <EditCustomerForm customer={customer} />
      </div>
    </div>
  );
}
