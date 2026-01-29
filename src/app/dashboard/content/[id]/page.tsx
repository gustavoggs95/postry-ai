import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ContentDetailClient from './ContentDetailClient';

export default async function ContentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const { data: content, error } = await supabase
    .from('content')
    .select('*, brands(name)')
    .eq('id', id)
    .single();

  if (error || !content) {
    redirect('/dashboard/content');
  }

  return <ContentDetailClient user={user} content={content} />;
}
