import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/api-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { openai } from '@/lib/openai';

// Generate content from transcription schema
const generateSchema = z.object({
  brandId: z.string().uuid().optional(),
  formats: z.array(z.enum(['tweets', 'blog', 'reels'])).default(['tweets', 'blog', 'reels']),
});

// POST /api/v1/assets/:id/generate - Generate content from transcription
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await getAuthenticatedUser(request);
  if (error || !user) {
    return unauthorizedResponse(error || undefined);
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = generateSchema.parse(body);

    // Get asset
    const { data: asset, error: assetError } = await supabaseAdmin
      .from('media_assets')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (assetError || !asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    if (!asset.transcription) {
      return NextResponse.json({ error: 'Asset must be transcribed first' }, { status: 400 });
    }

    // Get brand if provided
    let brandContext = '';
    if (validatedData.brandId) {
      const { data: brand } = await supabaseAdmin
        .from('brands')
        .select('*')
        .eq('id', validatedData.brandId)
        .eq('user_id', user.id)
        .single();

      if (brand) {
        brandContext = `
Brand Guidelines:
- Name: ${brand.name}
- Voice/Tone: ${brand.tone}
- Target Audience: ${brand.targetAudience || 'General audience'}
- Key Topics: ${brand.keywords?.join(', ') || 'Not specified'}
`;
      }
    }

    // Generate content with GPT-3.5
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert content strategist and social media manager. Your job is to repurpose video/audio transcriptions into engaging multi-format content.

${brandContext}

Always return valid JSON with the following structure:
{
  "tweets": ["tweet1", "tweet2", ...],
  "blogOutline": "markdown formatted blog outline",
  "reelsIdeas": ["idea1", "idea2", ...]
}`,
        },
        {
          role: 'user',
          content: `Please repurpose this transcription into engaging content:

TRANSCRIPTION:
${asset.transcription}

Generate:
1. A Twitter thread (5-7 tweets) that captures key insights
2. A blog post outline with sections and bullet points
3. 3-5 Instagram Reels/TikTok video ideas with hooks and concepts

Make the content engaging, shareable, and optimized for each platform.`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
    });

    const content = JSON.parse(completion.choices[0].message.content || '{}');

    // Ensure proper structure
    const formattedContent = {
      tweets: content.tweets || [],
      blogOutline: content.blogOutline || '',
      reelsIdeas: content.reelsIdeas || [],
    };

    return NextResponse.json({ content: formattedContent });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error generating content:', error);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}
