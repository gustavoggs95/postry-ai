import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AssetsClient from './AssetsClient';

export default async function AssetsPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's media assets
  const { data: assets } = await supabase
    .from('media_assets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch user's brands for content generation
  const { data: brands } = await supabase.from('brands').select('*').eq('user_id', user.id);

  return <AssetsClient initialAssets={assets || []} brands={brands || []} />;
}
