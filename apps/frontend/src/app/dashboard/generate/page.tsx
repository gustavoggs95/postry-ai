import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import GenerateClient from './GenerateClient';

export default async function GeneratePage() {
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
    .order('is_default', { ascending: false });

  return <GenerateClient user={user} initialBrands={brands || []} />;
}
