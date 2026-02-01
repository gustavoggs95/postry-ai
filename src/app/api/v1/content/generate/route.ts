import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/api-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { openai } from '@/lib/openai';
import { DEFAULT_BRAND, isDefaultBrand } from '@/lib/constants/default-brand';

// Generate content schema
const generateContentSchema = z.object({
  url: z.string().url().optional(),
  text: z.string().optional(),
  brandId: z
    .string()
    .refine((id) => id === DEFAULT_BRAND.id || z.string().uuid().safeParse(id).success, {
      message: 'Invalid brand ID',
    }),
  contentTypes: z.array(z.enum(['linkedin', 'tiktok', 'twitter', 'instagram', 'blog'])),
  generateImage: z.boolean().default(false),
  model: z.enum(['gpt-5-mini', 'gpt-5-nano']).default('gpt-5-mini'),
});

// POST /api/v1/content/generate - Generate content from URL or text
export async function POST(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser(request);
  if (error || !user) {
    return unauthorizedResponse(error || undefined);
  }

  try {
    const body = await request.json();
    const validatedData = generateContentSchema.parse(body);

    if (!validatedData.url && !validatedData.text) {
      return NextResponse.json({ error: 'Either URL or text is required' }, { status: 400 });
    }

    // Limit: 5 generations per user per month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const { count, error: countError } = await supabaseAdmin
      .from('content')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString())
      .lt('created_at', endOfMonth.toISOString());

    if (countError) {
      return NextResponse.json({ error: 'Failed to check usage limit' }, { status: 500 });
    }
    if ((count ?? 0) >= 5) {
      return NextResponse.json(
        { error: 'Monthly generation limit reached (5 per month)' },
        { status: 429 }
      );
    }

    // Fetch brand configuration
    let brand;

    // Check if using default brand
    if (isDefaultBrand(validatedData.brandId)) {
      brand = DEFAULT_BRAND;
    } else {
      const { data: brandExists } = await supabaseAdmin
        .from('brands')
        .select('id, user_id')
        .eq('id', validatedData.brandId)
        .maybeSingle();

      const { data: fetchedBrand, error: brandError } = await supabaseAdmin
        .from('brands')
        .select('*')
        .eq('id', validatedData.brandId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (brandError || !fetchedBrand) {
        console.error('Brand lookup error:', {
          brandId: validatedData.brandId,
          userId: user.id,
          error: brandError,
        });
        return NextResponse.json(
          {
            error: brandExists ? 'Brand does not belong to this user' : 'Brand not found',
            details:
              process.env.NODE_ENV === 'development'
                ? {
                    brandId: validatedData.brandId,
                    userId: user.id,
                    brandOwnerId: brandExists?.user_id,
                    supabaseError: brandError?.message,
                  }
                : undefined,
          },
          { status: 404 }
        );
      }

      brand = fetchedBrand;
    }

    // Build the brand voice prompt
    const brandVoice = `
Brand Voice Guidelines:
- Name: ${brand.name}
- Tone: ${brand.tone}
- Style: ${brand.style || 'Default professional style'}
- Uses Emojis: ${brand.use_emojis ? 'Yes, use emojis appropriately' : 'No, avoid emojis'}
- Target Audience: ${brand.target_audience || 'General professional audience'}
- Industry: ${brand.industry || 'Not specified'}
${brand.keywords?.length ? `- Key topics/keywords: ${brand.keywords.join(', ')}` : ''}
`;

    const sourceContent = validatedData.text || `Content from URL: ${validatedData.url}`;

    const generatedContent: Record<string, string> = {};

    // Check if using reasoning model
    const isReasoningModel = validatedData.model.startsWith('gpt-5');

    // Calculate appropriate token limit based on content length
    // Reasoning models need more tokens for long content (they use tokens for thinking)
    const contentLength = sourceContent.length;
    const baseTokens = isReasoningModel ? 2000 : 1000;
    const maxTokens = isReasoningModel && contentLength > 3000 ? 4000 : baseTokens;

    // Generate content for each requested type
    for (const contentType of validatedData.contentTypes) {
      const prompt = getPromptForContentType(contentType, sourceContent, brandVoice);

      const completion = await openai.chat.completions.create({
        model: validatedData.model,
        messages: isReasoningModel
          ? [
              {
                role: 'user',
                content: `You are an expert social media content creator. Create engaging content that matches the brand voice exactly.

${brandVoice}

${prompt}`,
              },
            ]
          : [
              {
                role: 'system',
                content: `You are an expert social media content creator. Create engaging content that matches the brand voice exactly. ${brandVoice}`,
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
        max_completion_tokens: maxTokens,
      });

      generatedContent[contentType] = completion.choices[0]?.message?.content || '';
    }

    // Generate cover image if requested
    let imageUrl = null;
    if (validatedData.generateImage) {
      const imageResponse = await openai.images.generate({
        model: 'dall-e-3',
        prompt: `Create a modern, professional social media cover image for: ${sourceContent.substring(0, 500)}. Style: Clean, minimal, suitable for LinkedIn/professional social media.`,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      });

      const tempUrl = imageResponse.data?.[0]?.url;

      // Download image from OpenAI and upload to Supabase Storage
      if (tempUrl) {
        try {
          const imageResponse = await fetch(tempUrl);
          const imageBlob = await imageResponse.blob();
          const fileName = `content-images/${user.id}/${Date.now()}.png`;

          const { error: uploadError } = await supabaseAdmin.storage
            .from('postry-bucket')
            .upload(fileName, imageBlob, {
              contentType: 'image/png',
              cacheControl: '3600',
            });

          if (uploadError) {
            console.error('Failed to upload image to storage:', uploadError);
          } else {
            // Get public URL
            const {
              data: { publicUrl },
            } = supabaseAdmin.storage.from('postry-bucket').getPublicUrl(fileName);
            imageUrl = publicUrl;
          }
        } catch (error) {
          console.error('Failed to save image:', error);
          // Fallback to temporary URL if upload fails
          imageUrl = tempUrl;
        }
      }
    }

    // Save to database
    const { data: savedContent, error: saveError } = await supabaseAdmin
      .from('content')
      .insert({
        user_id: user.id,
        brand_id: isDefaultBrand(validatedData.brandId) ? null : validatedData.brandId,
        source_url: validatedData.url,
        source_text: validatedData.text,
        generated_content: generatedContent,
        cover_image_url: imageUrl,
        status: 'draft',
      })
      .select()
      .single();

    if (saveError) throw saveError;

    return NextResponse.json(
      {
        content: savedContent,
        generated: generatedContent,
        imageUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error generating content:', error);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}

function getPromptForContentType(
  contentType: string,
  sourceContent: string,
  brandVoice: string
): string {
  switch (contentType) {
    case 'linkedin':
      return `Create a professional LinkedIn post based on the following content. Include a compelling hook, valuable insights, and a call-to-action. Keep it between 150-300 words.

Source Content:
${sourceContent}

Remember to match the brand voice:
${brandVoice}`;

    case 'tiktok':
      return `Create a TikTok/Reels script based on the following content. Include:
- A hook for the first 3 seconds
- Main points (keep it punchy and engaging)
- A call-to-action
Format it as a spoken script with timing notes.

Source Content:
${sourceContent}

Remember to match the brand voice:
${brandVoice}`;

    case 'twitter':
      return `Create a Twitter/X thread (3-5 tweets) based on the following content. Each tweet should be under 280 characters. Make it engaging and shareable.

Source Content:
${sourceContent}

Remember to match the brand voice:
${brandVoice}`;

    case 'instagram':
      return `Create an Instagram caption based on the following content. Include relevant hashtags (5-10) and a compelling caption that encourages engagement.

Source Content:
${sourceContent}

Remember to match the brand voice:
${brandVoice}`;

    case 'blog':
      return `Create a detailed blog post outline based on the following content. Include:
- A compelling title
- Introduction hook
- 3-5 main sections with bullet points
- Conclusion with call-to-action
Format it in markdown.

Source Content:
${sourceContent}

Remember to match the brand voice:
${brandVoice}`;

    default:
      return `Create social media content based on: ${sourceContent}`;
  }
}
