'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useBrandStore, Brand, BrandTone, CreateBrandInput } from '@/lib/stores';

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBrand: Brand | null;
  userId: string;
}

const toneOptions: { value: BrandTone; label: string; description: string }[] = [
  { value: 'professional', label: 'Professional', description: 'Formal, business-focused content' },
  { value: 'casual', label: 'Casual', description: 'Relaxed, conversational tone' },
  { value: 'friendly', label: 'Friendly', description: 'Warm, approachable communication' },
  { value: 'authoritative', label: 'Authoritative', description: 'Expert, confident voice' },
  { value: 'playful', label: 'Playful', description: 'Fun, lighthearted content' },
];

const industryOptions = [
  'Technology',
  'Marketing',
  'Finance',
  'Healthcare',
  'Education',
  'E-commerce',
  'Real Estate',
  'Food & Beverage',
  'Entertainment',
  'Travel',
  'Fitness',
  'Other',
];

export default function BrandModal({ isOpen, onClose, editingBrand, userId }: BrandModalProps) {
  const supabase = createClient();
  const { addBrand, updateBrand } = useBrandStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateBrandInput>({
    name: '',
    description: '',
    tone: 'professional',
    style: '',
    use_emojis: false,
    target_audience: '',
    industry: '',
    keywords: [],
  });

  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    if (editingBrand) {
      setFormData({
        name: editingBrand.name,
        description: editingBrand.description || '',
        tone: editingBrand.tone,
        style: editingBrand.style || '',
        use_emojis: editingBrand.use_emojis,
        target_audience: editingBrand.target_audience || '',
        industry: editingBrand.industry || '',
        keywords: editingBrand.keywords || [],
      });
    } else {
      setFormData({
        name: '',
        description: '',
        tone: 'professional',
        style: '',
        use_emojis: false,
        target_audience: '',
        industry: '',
        keywords: [],
      });
    }
    setError(null);
  }, [editingBrand, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (editingBrand) {
        // Update existing brand
        const { data, error } = await supabase
          .from('brands')
          .update({
            name: formData.name,
            description: formData.description || null,
            tone: formData.tone,
            style: formData.style || null,
            use_emojis: formData.use_emojis,
            target_audience: formData.target_audience || null,
            industry: formData.industry || null,
            keywords: formData.keywords?.length ? formData.keywords : null,
          })
          .eq('id', editingBrand.id)
          .select()
          .single();

        if (error) throw error;
        updateBrand(editingBrand.id, data);
      } else {
        // Create new brand
        const { data, error } = await supabase
          .from('brands')
          .insert({
            user_id: userId,
            name: formData.name,
            description: formData.description || null,
            tone: formData.tone,
            style: formData.style || null,
            use_emojis: formData.use_emojis,
            target_audience: formData.target_audience || null,
            industry: formData.industry || null,
            keywords: formData.keywords?.length ? formData.keywords : null,
          })
          .select()
          .single();

        if (error) throw error;
        addBrand(data);
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.keywords?.includes(keywordInput.trim())) {
      setFormData({
        ...formData,
        keywords: [...(formData.keywords || []), keywordInput.trim()],
      });
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords?.filter((k) => k !== keyword) || [],
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative m-4 max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border border-border bg-background-secondary shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {editingBrand ? 'Edit Brand Preset' : 'Create Brand Preset'}
              </h2>
              <p className="text-sm text-foreground-muted">
                Define your brand voice for consistent content
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-background-tertiary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {error && (
            <div className="rounded-lg border border-error/20 bg-error/10 p-3 text-sm text-error">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="name" className="label">
              Brand Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., My Tech Company"
              className="input"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="label">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this brand..."
              className="input min-h-[80px] resize-none"
              rows={3}
            />
          </div>

          {/* Tone Selection */}
          <div>
            <label className="label">Brand Tone *</label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {toneOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, tone: option.value })}
                  className={`rounded-lg border p-3 text-left transition-all ${
                    formData.tone === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-background hover:border-border-light'
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${formData.tone === option.value ? 'text-primary' : 'text-foreground'}`}
                  >
                    {option.label}
                  </p>
                  <p className="mt-0.5 text-xs text-foreground-muted">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Style Guidelines */}
          <div>
            <label htmlFor="style" className="label">
              Style Guidelines
            </label>
            <textarea
              id="style"
              value={formData.style}
              onChange={(e) => setFormData({ ...formData, style: e.target.value })}
              placeholder="e.g., Use short sentences. Avoid jargon. Include data when possible."
              className="input min-h-[80px] resize-none"
              rows={3}
            />
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Industry */}
            <div>
              <label htmlFor="industry" className="label">
                Industry
              </label>
              <select
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="input"
              >
                <option value="">Select industry...</option>
                {industryOptions.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Audience */}
            <div>
              <label htmlFor="audience" className="label">
                Target Audience
              </label>
              <input
                id="audience"
                type="text"
                value={formData.target_audience}
                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                placeholder="e.g., Tech professionals, 25-45"
                className="input"
              />
            </div>
          </div>

          {/* Use Emojis */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, use_emojis: !formData.use_emojis })}
              className={`relative h-6 w-12 rounded-full transition-colors ${
                formData.use_emojis ? 'bg-primary' : 'bg-border'
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                  formData.use_emojis ? 'translate-x-1' : '-translate-x-6'
                }`}
              />
            </button>
            <div>
              <p className="text-sm font-medium text-foreground">Use Emojis</p>
              <p className="text-xs text-foreground-muted">Include emojis in generated content</p>
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="label">Keywords & Topics</label>
            <div className="mb-2 flex gap-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                placeholder="Add keyword..."
                className="input flex-1"
              />
              <button type="button" onClick={handleAddKeyword} className="btn-secondary">
                Add
              </button>
            </div>
            {formData.keywords && formData.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center gap-1 rounded-lg bg-background-tertiary px-2 py-1 text-sm text-foreground"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="transition-colors hover:text-error"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isLoading || !formData.name} className="btn-primary">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingBrand ? 'Updating...' : 'Creating...'}
                </>
              ) : editingBrand ? (
                'Update Brand'
              ) : (
                'Create Brand'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
