'use client';

import { useState, useEffect } from 'react';
import {
  Sparkles,
  Link as LinkIcon,
  Type,
  Image as ImageIcon,
  Linkedin,
  Twitter,
  Instagram,
  Video,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  ChevronDown,
  Palette,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useBrandStore, useContentStore, Brand } from '@/lib/stores';
import { DEFAULT_BRAND } from '@/lib/constants/default-brand';

interface GenerateClientProps {
  initialBrands: Brand[];
}

const platformOptions = [
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'bg-blue-600' },
  { id: 'twitter', label: 'Twitter/X', icon: Twitter, color: 'bg-sky-500' },
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'bg-pink-500' },
  { id: 'tiktok', label: 'TikTok/Reels', icon: Video, color: 'bg-purple-500' },
] as const;

type Platform = (typeof platformOptions)[number]['id'];

export default function GenerateClient({ initialBrands }: GenerateClientProps) {
  const supabase = createClient();
  const { brands, setBrands, selectedBrand, selectBrand } = useBrandStore();
  const { isGenerating, setGenerating } = useContentStore();

  const [inputType, setInputType] = useState<'url' | 'text'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['linkedin']);
  const [generateImage, setGenerateImage] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gpt-5-mini' | 'gpt-5-nano'>('gpt-5-mini');
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);

  useEffect(() => {
    // Add default brand if user has no brands
    const brandsWithDefault = initialBrands.length === 0 ? [DEFAULT_BRAND] : initialBrands;
    setBrands(brandsWithDefault);
    if (brandsWithDefault.length > 0 && !selectedBrand) {
      const defaultBrand = brandsWithDefault.find((b) => b.is_default) || brandsWithDefault[0];
      selectBrand(defaultBrand);
    }
  }, [initialBrands, setBrands, selectBrand, selectedBrand]);

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const handleGenerate = async () => {
    if (!selectedBrand) {
      setError('Please select a brand preset first');
      return;
    }

    if (inputType === 'url' && !urlInput) {
      setError('Please enter a URL');
      return;
    }

    if (inputType === 'text' && !textInput) {
      setError('Please enter some text');
      return;
    }

    if (selectedPlatforms.length === 0) {
      setError('Please select at least one platform');
      return;
    }

    setError(null);
    setGenerating(true);
    setGeneratedContent({});
    setGeneratedImageUrl(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/v1/content/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          url: inputType === 'url' ? urlInput : undefined,
          text: inputType === 'text' ? textInput : undefined,
          brandId: selectedBrand.id,
          contentTypes: selectedPlatforms,
          generateImage,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate content');
      }

      const data = await response.json();
      setGeneratedContent(data.generated);
      setGeneratedImageUrl(data.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async (platform: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedPlatform(platform);
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-border px-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Generate Content</h1>
          <p className="text-sm text-foreground-muted">
            Transform articles into multi-platform content
          </p>
        </div>
      </header>

      <div className="p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Brand Selection */}
            <div className="card">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Brand Voice</h3>
              {brands.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="mb-3 text-foreground-muted">No brand presets yet</p>
                  <a href="/dashboard/brands" className="btn-primary inline-flex">
                    Create Brand Preset
                  </a>
                </div>
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
                    className="flex w-full items-center justify-between rounded-lg border border-border bg-background p-3 transition-colors hover:border-border-light"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                        <Palette className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-foreground">
                          {selectedBrand?.name || 'Select a brand'}
                        </p>
                        {selectedBrand && (
                          <p className="text-xs capitalize text-foreground-muted">
                            {selectedBrand.tone}
                            {selectedBrand.use_emojis && ' • Uses emojis'}
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-foreground-muted transition-transform ${brandDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {brandDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-2 max-h-60 overflow-auto rounded-lg border border-border bg-background-secondary shadow-xl">
                      {brands.map((brand) => (
                        <button
                          key={brand.id}
                          onClick={() => {
                            selectBrand(brand);
                            setBrandDropdownOpen(false);
                          }}
                          className={`flex w-full items-center gap-3 p-3 transition-colors hover:bg-background-tertiary ${
                            selectedBrand?.id === brand.id ? 'bg-primary/10' : ''
                          }`}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                            <Palette className="h-4 w-4 text-primary" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-foreground">{brand.name}</p>
                            <p className="text-xs capitalize text-foreground-muted">{brand.tone}</p>
                          </div>
                          {brand.is_default && (
                            <span className="ml-auto text-xs text-primary">Default</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input Type Toggle */}
            <div className="card">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Content Source</h3>
              <div className="mb-4 flex gap-2">
                <button
                  onClick={() => setInputType('url')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 transition-colors ${
                    inputType === 'url'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-foreground-muted hover:border-border-light'
                  }`}
                >
                  <LinkIcon className="h-4 w-4" />
                  From URL
                </button>
                <button
                  onClick={() => setInputType('text')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 transition-colors ${
                    inputType === 'text'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-foreground-muted hover:border-border-light'
                  }`}
                >
                  <Type className="h-4 w-4" />
                  From Text
                </button>
              </div>

              {inputType === 'url' ? (
                <div>
                  <label htmlFor="url" className="label">
                    Article URL
                  </label>
                  <input
                    id="url"
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/blog-article"
                    className="input"
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="text" className="label">
                    Content Text
                  </label>
                  <textarea
                    id="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Paste your article, blog post, or any content here..."
                    className="input min-h-[150px] resize-none"
                    rows={6}
                  />
                </div>
              )}
            </div>

            {/* Platform Selection */}
            <div className="card">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Target Platforms</h3>
              <div className="grid grid-cols-2 gap-3">
                {platformOptions.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                      selectedPlatforms.includes(platform.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-border-light'
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-lg ${platform.color} flex items-center justify-center`}
                    >
                      <platform.icon className="h-4 w-4 text-white" />
                    </div>
                    <span
                      className={`font-medium ${selectedPlatforms.includes(platform.id) ? 'text-primary' : 'text-foreground'}`}
                    >
                      {platform.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Image Generation */}
            <div className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                    <ImageIcon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Generate Cover Image</h3>
                    <p className="text-sm text-foreground-muted">
                      Create an AI-generated cover image
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setGenerateImage(!generateImage)}
                  className={`relative h-6 w-12 rounded-full transition-colors ${
                    generateImage ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                      generateImage ? 'translate-x-1' : '-translate-x-5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* AI Model Selection */}
            <div className="card">
              <h3 className="mb-4 text-lg font-semibold text-foreground">AI Model</h3>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as 'gpt-5-mini' | 'gpt-5-nano')}
                className="input w-full"
              >
                <option value="gpt-5-mini">GPT-5 Mini (Recommended)</option>
                <option value="gpt-5-nano">GPT-5 Nano (Fastest & Cheapest)</option>
              </select>
              <p className="mt-2 text-xs text-foreground-muted">
                {selectedModel === 'gpt-5-mini' &&
                  'Balanced performance and cost - great for most use cases'}
                {selectedModel === 'gpt-5-nano' && 'Fastest generation - most cost-effective'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-error/20 bg-error/10 p-3 text-sm text-error">
                {error}
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedBrand}
              className="btn-primary w-full py-3 text-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Content...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Content
                </>
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Generated Content</h3>

              {Object.keys(generatedContent).length === 0 && !isGenerating ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-background-tertiary">
                    <Sparkles className="h-8 w-8 text-foreground-muted" />
                  </div>
                  <p className="text-foreground-muted">Your generated content will appear here</p>
                </div>
              ) : isGenerating ? (
                <div className="py-12 text-center">
                  <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
                  <p className="text-foreground-muted">AI is crafting your content...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {generatedImageUrl && (
                    <div className="rounded-lg border border-border bg-background p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-accent">
                          <ImageIcon className="h-3 w-3 text-white" />
                        </div>
                        <span className="font-medium text-foreground">Cover Image</span>
                      </div>
                      <img
                        src={generatedImageUrl}
                        alt="Generated cover"
                        className="w-full rounded-lg"
                      />
                    </div>
                  )}

                  {platformOptions
                    .filter((p) => generatedContent[p.id])
                    .map((platform) => (
                      <div
                        key={platform.id}
                        className="rounded-lg border border-border bg-background p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-6 w-6 rounded ${platform.color} flex items-center justify-center`}
                            >
                              <platform.icon className="h-3 w-3 text-white" />
                            </div>
                            <span className="font-medium text-foreground">{platform.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopy(platform.id, generatedContent[platform.id])}
                              className="rounded p-1.5 text-foreground-muted transition-colors hover:bg-background-tertiary hover:text-foreground"
                              title="Copy to clipboard"
                            >
                              {copiedPlatform === platform.id ? (
                                <Check className="h-4 w-4 text-success" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={handleGenerate}
                              className="rounded p-1.5 text-foreground-muted transition-colors hover:bg-background-tertiary hover:text-foreground"
                              title="Regenerate"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="whitespace-pre-wrap text-sm text-foreground">
                          {generatedContent[platform.id]}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
