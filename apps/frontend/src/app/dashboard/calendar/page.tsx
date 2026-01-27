import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CalendarClient from './CalendarClient';

export default async function CalendarPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's scheduled content
  const { data: scheduledContent } = await supabase
    .from('scheduled_content')
    .select('*, content(*, brands(name))')
    .eq('content.user_id', user.id)
    .order('scheduled_at', { ascending: true });

  // Fetch all content for scheduling
  const { data: content } = await supabase
    .from('content')
    .select('*, brands(name)')
    .eq('user_id', user.id)
    .in('status', ['draft', 'approved'])
    .order('created_at', { ascending: false });

  return (
    <CalendarClient
      user={user}
      initialScheduledContent={scheduledContent || []}
      availableContent={content || []}
    />
  );
}
