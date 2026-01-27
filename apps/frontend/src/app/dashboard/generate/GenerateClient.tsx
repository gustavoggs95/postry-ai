'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import {
  Sparkles,
  LayoutDashboard,
  Palette,
  FileText,
  Calendar,
  Settings,
  LogOut,
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
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useBrandStore, useContentStore, Brand } from '@/lib/stores';

interface GenerateClientProps {
  user: User;
  initialBrands: Brand[];
}

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Sparkles, label: 'Generate', href: '/dashboard/generate', active: true },
  { icon: Palette, label: 'Brand Presets', href: '/dashboard/brands' },
  { icon: FileText, label: 'Content', href: '/dashboard/content' },
  { icon: Calendar, label: 'Calendar', href: '/dashboard/calendar' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

const platformOptions = [
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'bg-blue-600' },
  { id: 'twitter', label: 'Twitter/X', icon: Twitter, color: 'bg-sky-500' },
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'bg-pink-500' },
  { id: 'tiktok', label: 'TikTok/Reels', icon: Video, color: 'bg-purple-500' },
] as const;

type Platform = (typeof platformOptions)[number]['id'];

export default function GenerateClient({ user, initialBrands }: GenerateClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const { brands, setBrands, selectedBrand, selectBrand } = useBrandStore();
  const { isGenerating, setGenerating } = useContentStore();

  const [inputType, setInputType] = useState<'url' | 'text'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['linkedin']);
  const [generateImage, setGenerateImage] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);

  useEffect(() => {
    setBrands(initialBrands);
    if (initialBrands.length > 0 && !selectedBrand) {
      const defaultBrand = initialBrands.find((b) => b.is_default) || initialBrands[0];
      selectBrand(defaultBrand);
    }
  }, [initialBrands, setBrands, selectBrand, selectedBrand]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

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

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  return (
    <div className="bg-background flex min-h-screen">
      {/* Sidebar */}
      <aside className="bg-background-secondary border-border flex w-64 flex-col border-r">
        <div className="border-border flex h-16 items-center gap-2 border-b px-4">
          <div className="bg-gradient-primary flex h-10 w-10 items-center justify-center rounded-xl">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-foreground text-xl font-bold">Postry AI</span>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                    item.active
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground-muted hover:bg-background-tertiary hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-border border-t p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-primary/20 flex h-10 w-10 items-center justify-center rounded-full">
              <span className="text-primary font-medium">{userName.charAt(0).toUpperCase()}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-foreground truncate text-sm font-medium">{userName}</p>
              <p className="text-foreground-muted truncate text-xs">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="text-foreground-muted hover:bg-background-tertiary hover:text-foreground flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <header className="border-border flex h-16 items-center justify-between border-b px-6">
          <div>
            <h1 className="text-foreground text-xl font-semibold">Generate Content</h1>
            <p className="text-foreground-muted text-sm">
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
                <h3 className="text-foreground mb-4 text-lg font-semibold">Brand Voice</h3>
                {brands.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-foreground-muted mb-3">No brand presets yet</p>
                    <a href="/dashboard/brands" className="btn-primary inline-flex">
                      Create Brand Preset
                    </a>
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
                      className="border-border bg-background hover:border-border-light flex w-full items-center justify-between rounded-lg border p-3 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/20 flex h-8 w-8 items-center justify-center rounded-lg">
                          <Palette className="text-primary h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <p className="text-foreground font-medium">
                            {selectedBrand?.name || 'Select a brand'}
                          </p>
                          {selectedBrand && (
                            <p className="text-foreground-muted text-xs capitalize">
                              {selectedBrand.tone}
                              {selectedBrand.use_emojis && ' • Uses emojis'}
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronDown
                        className={`text-foreground-muted h-5 w-5 transition-transform ${brandDropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {brandDropdownOpen && (
                      <div className="bg-background-secondary border-border absolute left-0 right-0 top-full z-10 mt-2 max-h-60 overflow-auto rounded-lg border shadow-xl">
                        {brands.map((brand) => (
                          <button
                            key={brand.id}
                            onClick={() => {
                              selectBrand(brand);
                              setBrandDropdownOpen(false);
                            }}
                            className={`hover:bg-background-tertiary flex w-full items-center gap-3 p-3 transition-colors ${
                              selectedBrand?.id === brand.id ? 'bg-primary/10' : ''
                            }`}
                          >
                            <div className="bg-primary/20 flex h-8 w-8 items-center justify-center rounded-lg">
                              <Palette className="text-primary h-4 w-4" />
                            </div>
                            <div className="text-left">
                              <p className="text-foreground font-medium">{brand.name}</p>
                              <p className="text-foreground-muted text-xs capitalize">
                                {brand.tone}
                              </p>
                            </div>
                            {brand.is_default && (
                              <span className="text-primary ml-auto text-xs">Default</span>
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
                <h3 className="text-foreground mb-4 text-lg font-semibold">Content Source</h3>
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
                <h3 className="text-foreground mb-4 text-lg font-semibold">Target Platforms</h3>
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
                    <div className="bg-accent/20 flex h-10 w-10 items-center justify-center rounded-lg">
                      <ImageIcon className="text-accent h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-foreground font-semibold">Generate Cover Image</h3>
                      <p className="text-foreground-muted text-sm">
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
                        generateImage ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-error/10 border-error/20 text-error rounded-lg border p-3 text-sm">
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
                <h3 className="text-foreground mb-4 text-lg font-semibold">Generated Content</h3>

                {Object.keys(generatedContent).length === 0 && !isGenerating ? (
                  <div className="py-12 text-center">
                    <div className="bg-background-tertiary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
                      <Sparkles className="text-foreground-muted h-8 w-8" />
                    </div>
                    <p className="text-foreground-muted">Your generated content will appear here</p>
                  </div>
                ) : isGenerating ? (
                  <div className="py-12 text-center">
                    <Loader2 className="text-primary mx-auto mb-4 h-12 w-12 animate-spin" />
                    <p className="text-foreground-muted">AI is crafting your content...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {platformOptions
                      .filter((p) => generatedContent[p.id])
                      .map((platform) => (
                        <div
                          key={platform.id}
                          className="bg-background border-border rounded-lg border p-4"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-6 w-6 rounded ${platform.color} flex items-center justify-center`}
                              >
                                <platform.icon className="h-3 w-3 text-white" />
                              </div>
                              <span className="text-foreground font-medium">{platform.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleCopy(platform.id, generatedContent[platform.id])
                                }
                                className="hover:bg-background-tertiary text-foreground-muted hover:text-foreground rounded p-1.5 transition-colors"
                                title="Copy to clipboard"
                              >
                                {copiedPlatform === platform.id ? (
                                  <Check className="text-success h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                onClick={handleGenerate}
                                className="hover:bg-background-tertiary text-foreground-muted hover:text-foreground rounded p-1.5 transition-colors"
                                title="Regenerate"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="text-foreground whitespace-pre-wrap text-sm">
                            {generatedContent[platform.id]}
                          </div>
                        </div>
                      ))}

                    {generatedImageUrl && (
                      <div className="bg-background border-border rounded-lg border p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <div className="bg-accent flex h-6 w-6 items-center justify-center rounded">
                            <ImageIcon className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-foreground font-medium">Cover Image</span>
                        </div>
                        <img
                          src={generatedImageUrl}
                          alt="Generated cover"
                          className="w-full rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
