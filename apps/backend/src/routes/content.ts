import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';
import { openai } from '../lib/openai.js';

const router = Router();

// All content routes require authentication
router.use(authMiddleware);

// Generate content schema
const generateContentSchema = z.object({
  url: z.string().url().optional(),
  text: z.string().optional(),
  brandId: z.string().uuid(),
  contentTypes: z.array(z.enum(['linkedin', 'tiktok', 'twitter', 'instagram'])),
  generateImage: z.boolean().default(false),
});

// Get all content for user
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('*, brands(name)')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ content: data });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Get single content item
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('*, brands(name)')
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({ content: data });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Generate content from URL or text
router.post('/generate', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = generateContentSchema.parse(req.body);

    if (!validatedData.url && !validatedData.text) {
      return res.status(400).json({ error: 'Either URL or text is required' });
    }

    // Fetch brand configuration
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('*')
      .eq('id', validatedData.brandId)
      .eq('user_id', req.user!.id)
      .single();

    if (brandError || !brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    // Build the brand voice prompt
    const brandVoice = `
Brand Voice Guidelines:
- Name: ${brand.name}
- Tone: ${brand.tone}
- Style: ${brand.style || 'Default professional style'}
- Uses Emojis: ${brand.useEmojis ? 'Yes, use emojis appropriately' : 'No, avoid emojis'}
- Target Audience: ${brand.targetAudience || 'General professional audience'}
- Industry: ${brand.industry || 'Not specified'}
${brand.keywords?.length ? `- Key topics/keywords: ${brand.keywords.join(', ')}` : ''}
`;

    const sourceContent = validatedData.text || `Content from URL: ${validatedData.url}`;

    const generatedContent: Record<string, string> = {};

    // Generate content for each requested type
    for (const contentType of validatedData.contentTypes) {
      const prompt = getPromptForContentType(contentType, sourceContent, brandVoice);

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert social media content creator. Create engaging content that matches the brand voice exactly. ${brandVoice}`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
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

      imageUrl = imageResponse.data?.[0]?.url;
    }

    // Save to database
    const { data: savedContent, error: saveError } = await supabase
      .from('content')
      .insert({
        user_id: req.user!.id,
        brand_id: validatedData.brandId,
        source_url: validatedData.url,
        source_text: validatedData.text,
        generated_content: generatedContent,
        cover_image_url: imageUrl,
        status: 'draft',
      })
      .select()
      .single();

    if (saveError) throw saveError;

    res.status(201).json({
      content: savedContent,
      generated: generatedContent,
      imageUrl,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

// Update content status
router.patch('/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = z
      .object({
        status: z.enum(['draft', 'approved', 'published', 'archived']),
      })
      .parse(req.body);

    const { data, error } = await supabase
      .from('content')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({ content: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating content status:', error);
    res.status(500).json({ error: 'Failed to update content status' });
  }
});

// Update content text
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { generated_content } = req.body;

    const { data, error } = await supabase
      .from('content')
      .update({
        generated_content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({ content: data });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ error: 'Failed to update content' });
  }
});

// Delete content
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error } = await supabase
      .from('content')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id);

    if (error) throw error;

    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

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

    default:
      return `Create social media content based on: ${sourceContent}`;
  }
}

export default router;
