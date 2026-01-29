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

// GET /api/v1/brands - Get all brands for user
export async function GET(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser(request);
  if (error || !user) {
    return unauthorizedResponse(error || undefined);
  }

  try {
    const { data, error: dbError } = await supabaseAdmin
      .from('brands')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (dbError) throw dbError;

    return NextResponse.json({ brands: data });
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}

// POST /api/v1/brands - Create brand
export async function POST(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser(request);
  if (error || !user) {
    return unauthorizedResponse(error || undefined);
  }

  try {
    const body = await request.json();
    const validatedData = createBrandSchema.parse(body);

    const { data, error: dbError } = await supabaseAdmin
      .from('brands')
      .insert({
        ...validatedData,
        user_id: user.id,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ brand: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating brand:', error);
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
  }
}
