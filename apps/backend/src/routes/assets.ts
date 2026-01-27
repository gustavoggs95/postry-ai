import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { openai } from '../lib/openai.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Apply authentication to all routes
router.use(authMiddleware);

// Transcribe asset
router.post('/:id/transcribe', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const userId = authReq.user.id;

    // Get asset
    const { data: asset, error: assetError } = await supabase
      .from('media_assets')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (assetError || !asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Check if already transcribed
    if (asset.transcription) {
      return res.json({ transcription: asset.transcription });
    }

    // Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('media-assets')
      .download(asset.storage_path);

    if (downloadError || !fileData) {
      return res.status(500).json({ error: 'Failed to download file' });
    }

    // Convert blob to File for OpenAI
    const file = new File([fileData], asset.filename, { type: asset.file_type });

    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en',
      response_format: 'text',
    });

    // Save transcription
    const { error: updateError } = await supabase
      .from('media_assets')
      .update({ transcription })
      .eq('id', id);

    if (updateError) {
      console.error('Failed to save transcription:', updateError);
    }

    return res.json({ transcription });
  } catch (error) {
    next(error);
  }
});

// Generate content from transcription
const generateSchema = z.object({
  brandId: z.string().uuid().optional(),
  formats: z.array(z.enum(['tweets', 'blog', 'reels'])).default(['tweets', 'blog', 'reels']),
});

router.post('/:id/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const userId = authReq.user.id;

    const validatedData = generateSchema.parse(req.body);

    // Get asset
    const { data: asset, error: assetError } = await supabase
      .from('media_assets')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (assetError || !asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    if (!asset.transcription) {
      return res.status(400).json({ error: 'Asset must be transcribed first' });
    }

    // Get brand if provided
    let brandContext = '';
    if (validatedData.brandId) {
      const { data: brand } = await supabase
        .from('brands')
        .select('*')
        .eq('id', validatedData.brandId)
        .eq('user_id', userId)
        .single();

      if (brand) {
        brandContext = `
Brand Guidelines:
- Name: ${brand.name}
- Voice/Tone: ${brand.voice_tone}
- Target Audience: ${brand.target_audience}
- Key Topics: ${brand.key_topics?.join(', ')}
`;
      }
    }

    // Generate content with GPT-4
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
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

    return res.json({ content: formattedContent });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    next(error);
  }
});

// Get all assets for user
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;

    const { data: assets, error } = await supabase
      .from('media_assets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch assets' });
    }

    return res.json({ assets });
  } catch (error) {
    next(error);
  }
});

// Delete asset
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const userId = authReq.user.id;

    // Get asset to find storage path
    const { data: asset, error: assetError } = await supabase
      .from('media_assets')
      .select('storage_path')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (assetError || !asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Delete from storage
    await supabase.storage.from('media-assets').remove([asset.storage_path]);

    // Delete from database
    const { error: deleteError } = await supabase.from('media_assets').delete().eq('id', id);

    if (deleteError) {
      return res.status(500).json({ error: 'Failed to delete asset' });
    }

    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
