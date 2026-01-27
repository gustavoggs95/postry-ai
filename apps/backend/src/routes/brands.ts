import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';

const router = Router();

// All brand routes require authentication
router.use(authMiddleware);

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

// Get all brands for user
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ brands: data });
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

// Get single brand
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    res.json({ brand: data });
  } catch (error) {
    console.error('Error fetching brand:', error);
    res.status(500).json({ error: 'Failed to fetch brand' });
  }
});

// Create brand
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = createBrandSchema.parse(req.body);

    const { data, error } = await supabase
      .from('brands')
      .insert({
        ...validatedData,
        user_id: req.user!.id,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ brand: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating brand:', error);
    res.status(500).json({ error: 'Failed to create brand' });
  }
});

// Update brand
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = createBrandSchema.partial().parse(req.body);

    const { data, error } = await supabase
      .from('brands')
      .update(validatedData)
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    res.json({ brand: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating brand:', error);
    res.status(500).json({ error: 'Failed to update brand' });
  }
});

// Delete brand
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id);

    if (error) throw error;

    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Error deleting brand:', error);
    res.status(500).json({ error: 'Failed to delete brand' });
  }
});

export default router;
