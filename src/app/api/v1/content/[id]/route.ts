import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/api-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET /api/v1/content/:id - Get single content item
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await getAuthenticatedUser(request);
  if (error || !user) {
    return unauthorizedResponse(error || undefined);
  }

  try {
    const { id } = await params;
    const { data, error: dbError } = await supabaseAdmin
      .from('content')
      .select('*, brands(name)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (dbError) throw dbError;
    if (!data) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    return NextResponse.json({ content: data });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

// PUT /api/v1/content/:id - Update content text
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await getAuthenticatedUser(request);
  if (error || !user) {
    return unauthorizedResponse(error || undefined);
  }

  try {
    const { id } = await params;
    const { generated_content } = await request.json();

    const { data, error: dbError } = await supabaseAdmin
      .from('content')
      .update({
        generated_content,
        updated_at: new Date().toISOString(),
      })
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
    console.error('Error updating content:', error);
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
}

// DELETE /api/v1/content/:id - Delete content
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await getAuthenticatedUser(request);
  if (error || !user) {
    return unauthorizedResponse(error || undefined);
  }

  try {
    const { id } = await params;
    const { error: dbError } = await supabaseAdmin
      .from('content')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (dbError) throw dbError;

    return NextResponse.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 });
  }
}
