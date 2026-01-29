import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ContentClient from './ContentClient';

export default async function ContentPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's content with brand info
  const { data: content } = await supabase
    .from('content')
    .select('*, brands(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return <ContentClient initialContent={content || []} />;
}
