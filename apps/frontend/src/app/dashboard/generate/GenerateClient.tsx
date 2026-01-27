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
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-background-secondary border-r border-border flex flex-col">
        <div className="h-16 flex items-center gap-2 px-4 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">Postry AI</span>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    item.active
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground-muted hover:bg-background-tertiary hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-medium">{userName.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{userName}</p>
              <p className="text-xs text-foreground-muted truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-foreground-muted hover:bg-background-tertiary hover:text-foreground transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 border-b border-border flex items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Generate Content</h1>
            <p className="text-sm text-foreground-muted">
              Transform articles into multi-platform content
            </p>
          </div>
        </header>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-6">
              {/* Brand Selection */}
              <div className="card">
                <h3 className="text-lg font-semibold text-foreground mb-4">Brand Voice</h3>
                {brands.length === 0 ? (
                  <div className="text-center py-6">
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
                      className="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:border-border-light transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Palette className="w-4 h-4 text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-foreground">
                            {selectedBrand?.name || 'Select a brand'}
                          </p>
                          {selectedBrand && (
                            <p className="text-xs text-foreground-muted capitalize">
                              {selectedBrand.tone}
                              {selectedBrand.use_emojis && ' • Uses emojis'}
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-foreground-muted transition-transform ${brandDropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {brandDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-background-secondary border border-border rounded-lg shadow-xl z-10 max-h-60 overflow-auto">
                        {brands.map((brand) => (
                          <button
                            key={brand.id}
                            onClick={() => {
                              selectBrand(brand);
                              setBrandDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 p-3 hover:bg-background-tertiary transition-colors ${
                              selectedBrand?.id === brand.id ? 'bg-primary/10' : ''
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                              <Palette className="w-4 h-4 text-primary" />
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-foreground">{brand.name}</p>
                              <p className="text-xs text-foreground-muted capitalize">
                                {brand.tone}
                              </p>
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
                <h3 className="text-lg font-semibold text-foreground mb-4">Content Source</h3>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setInputType('url')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
                      inputType === 'url'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-foreground-muted hover:border-border-light'
                    }`}
                  >
                    <LinkIcon className="w-4 h-4" />
                    From URL
                  </button>
                  <button
                    onClick={() => setInputType('text')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
                      inputType === 'text'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-foreground-muted hover:border-border-light'
                    }`}
                  >
                    <Type className="w-4 h-4" />
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
                <h3 className="text-lg font-semibold text-foreground mb-4">Target Platforms</h3>
                <div className="grid grid-cols-2 gap-3">
                  {platformOptions.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => togglePlatform(platform.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        selectedPlatforms.includes(platform.id)
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-border-light'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${platform.color} flex items-center justify-center`}>
                        <platform.icon className="w-4 h-4 text-white" />
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
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-accent" />
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
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      generateImage ? 'bg-primary' : 'bg-border'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        generateImage ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-error/10 border border-error/20 text-error rounded-lg p-3 text-sm">
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
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Content...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Content
                  </>
                )}
              </button>
            </div>

            {/* Output Section */}
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-foreground mb-4">Generated Content</h3>

                {Object.keys(generatedContent).length === 0 && !isGenerating ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-background-tertiary mx-auto mb-4 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-foreground-muted" />
                    </div>
                    <p className="text-foreground-muted">
                      Your generated content will appear here
                    </p>
                  </div>
                ) : isGenerating ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
                    <p className="text-foreground-muted">
                      AI is crafting your content...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {platformOptions
                      .filter((p) => generatedContent[p.id])
                      .map((platform) => (
                        <div
                          key={platform.id}
                          className="p-4 rounded-lg bg-background border border-border"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-6 h-6 rounded ${platform.color} flex items-center justify-center`}
                              >
                                <platform.icon className="w-3 h-3 text-white" />
                              </div>
                              <span className="font-medium text-foreground">{platform.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleCopy(platform.id, generatedContent[platform.id])}
                                className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors"
                                title="Copy to clipboard"
                              >
                                {copiedPlatform === platform.id ? (
                                  <Check className="w-4 h-4 text-success" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={handleGenerate}
                                className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors"
                                title="Regenerate"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="text-sm text-foreground whitespace-pre-wrap">
                            {generatedContent[platform.id]}
                          </div>
                        </div>
                      ))}

                    {generatedImageUrl && (
                      <div className="p-4 rounded-lg bg-background border border-border">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 rounded bg-accent flex items-center justify-center">
                            <ImageIcon className="w-3 h-3 text-white" />
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
