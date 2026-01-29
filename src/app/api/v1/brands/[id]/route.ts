import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/api-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Create brand schema
const createBrandSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  tone: z.enum(['professional', 'casual', 'friendly', 'authoritative', 'playful']),
  style: z.string().optional(),
  useEmojis: z.boolean().default(false),
  targetAudience: z.string().optional(),
  industry: z.string().optional(),
  keywords: z.array(z.string()).optional(),
});

// GET /api/v1/brands/:id - Get single brand
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await getAuthenticatedUser(request);
  if (error || !user) {
    return unauthorizedResponse(error || undefined);
  }

  try {
    const { id } = await params;
    const { data, error: dbError } = await supabaseAdmin
      .from('brands')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (dbError) throw dbError;
    if (!data) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json({ brand: data });
  } catch (error) {
    console.error('Error fetching brand:', error);
    return NextResponse.json({ error: 'Failed to fetch brand' }, { status: 500 });
  }
}

// PUT /api/v1/brands/:id - Update brand
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await getAuthenticatedUser(request);
  if (error || !user) {
    return unauthorizedResponse(error || undefined);
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = createBrandSchema.partial().parse(body);

    const { data, error: dbError } = await supabaseAdmin
      .from('brands')
      .update(validatedData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (dbError) throw dbError;
    if (!data) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json({ brand: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating brand:', error);
    return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 });
  }
}

// DELETE /api/v1/brands/:id - Delete brand
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
      .from('brands')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (dbError) throw dbError;

    return NextResponse.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 });
  }
}
