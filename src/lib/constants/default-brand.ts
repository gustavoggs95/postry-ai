import { Brand } from '@/lib/stores/brand-store';

// Default brand voice used when user hasn't created any brands
export const DEFAULT_BRAND: Brand = {
  id: 'default-brand-voice',
  user_id: '',
  name: 'Standard Voice',
  description: 'Professional and balanced tone',
  tone: 'professional',
  style: 'Clear, concise, and engaging',
  use_emojis: false,
  target_audience: 'General professional audience',
  industry: undefined,
  keywords: [],
  logo_url: undefined,
  is_default: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const isDefaultBrand = (brandId: string | undefined): boolean => {
  return brandId === DEFAULT_BRAND.id;
};
