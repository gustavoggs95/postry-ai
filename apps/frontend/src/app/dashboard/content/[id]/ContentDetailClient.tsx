'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import {
  Sparkles,
  LayoutDashboard,
  Palette,
  FileText,
  Calendar,
  Settings,
  ArrowLeft,
  Copy,
  CheckCircle,
  Linkedin,
  Twitter,
  Instagram,
  Video,
  Download,
  ExternalLink,
} from 'lucide-react';

interface ContentDetailClientProps {
  user: User;
  content: any;
}

const platformIcons: Record<string, typeof Linkedin> = {
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
  tiktok: Video,
};

const platformLabels: Record<string, string> = {
  linkedin: 'LinkedIn',
  twitter: 'Twitter',
  instagram: 'Instagram',
  tiktok: 'TikTok',
};

export default function ContentDetailClient({ user, content }: ContentDetailClientProps) {
  const router = useRouter();
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  const handleCopy = (platform: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPlatform(platform);
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  const generatedContent = content.generated_content || {};
  const platforms = Object.keys(generatedContent);

  return (
    <>
      {/* Header */}
      <header className="border-border flex h-16 items-center justify-between border-b px-6">
        <button
          onClick={() => router.push('/dashboard/content')}
          className="btn-ghost flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Content
        </button>
        <div className="flex items-center gap-2">
          {content.brands?.name && (
            <span className="bg-primary/20 text-primary rounded-full px-3 py-1 text-sm font-medium">
              {content.brands.name}
            </span>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        {/* Cover Image */}
        {content.cover_image_url && (
          <div className="card mb-6 overflow-hidden p-0">
            <img src={content.cover_image_url} alt="Cover" className="h-64 w-full object-cover" />
          </div>
        )}

        {/* Source Info */}
        <div className="card mb-6">
          <h2 className="text-foreground mb-2 text-lg font-semibold">Source</h2>
          {content.source_url ? (
            <a
              href={content.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 flex items-center gap-2 transition-colors"
            >
              {content.source_url}
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : (
            <p className="text-foreground-muted">{content.source_text}</p>
          )}
          <p className="text-foreground-muted mt-2 text-sm">
            Created: {new Date(content.created_at).toLocaleString()}
          </p>
        </div>

        {/* Generated Content */}
        <div className="space-y-6">
          <h2 className="text-foreground text-xl font-semibold">Generated Content</h2>

          {platforms.length === 0 ? (
            <div className="card py-12 text-center">
              <p className="text-foreground-muted">No content generated yet</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {platforms.map((platform) => {
                const Icon = platformIcons[platform];
                const platformContent = generatedContent[platform];

                return (
                  <div key={platform} className="card">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {Icon && <Icon className="text-primary h-5 w-5" />}
                        <h3 className="text-foreground font-semibold">
                          {platformLabels[platform] || platform}
                        </h3>
                      </div>
                      <button
                        onClick={() => handleCopy(platform, platformContent)}
                        className="btn-ghost flex items-center gap-2"
                      >
                        {copiedPlatform === platform ? (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-background-tertiary rounded-lg p-4">
                      <p className="text-foreground whitespace-pre-wrap text-sm">
                        {platformContent}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
