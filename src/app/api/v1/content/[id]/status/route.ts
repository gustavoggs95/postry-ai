import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/api-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

// PATCH /api/v1/content/:id/status - Update content status
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await getAuthenticatedUser(request);
  if (error || !user) {
    return unauthorizedResponse(error || undefined);
  }

  try {
    const { id } = await params;
    const { status } = z
      .object({
        status: z.enum(['draft', 'approved', 'published', 'archived']),
      })
      .parse(await request.json());

    const { data, error: dbError } = await supabaseAdmin
      .from('content')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (dbError) throw dbError;
    if (!data) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    return NextResponse.json({ content: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating content status:', error);
    return NextResponse.json({ error: 'Failed to update content status' }, { status: 500 });
  }
}
