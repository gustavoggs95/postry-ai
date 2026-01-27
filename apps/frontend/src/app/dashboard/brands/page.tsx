import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BrandsClient from './BrandsClient';

export default async function BrandsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's brands
  const { data: brands } = await supabase
    .from('brands')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return <BrandsClient user={user} initialBrands={brands || []} />;
}
