'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Copy,
  CheckCircle,
  Linkedin,
  Twitter,
  Instagram,
  Video,
  ExternalLink,
} from 'lucide-react';

interface ContentDetailClientProps {
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

export default function ContentDetailClient({ content }: ContentDetailClientProps) {
  const router = useRouter();
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [formattedDate, setFormattedDate] = useState<string>('');

  useEffect(() => {
    // Format date on client side only to avoid hydration mismatch
    setFormattedDate(new Date(content.created_at).toLocaleString());
  }, [content.created_at]);

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
      <header className="flex h-16 items-center justify-between border-b border-border px-6">
        <button
          onClick={() => router.push('/dashboard/content')}
          className="btn-ghost flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Content
        </button>
        <div className="flex items-center gap-2">
          {content.brands?.name && (
            <span className="rounded-full bg-primary/20 px-3 py-1 text-sm font-medium text-primary">
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
          <h2 className="mb-2 text-lg font-semibold text-foreground">Source</h2>
          {content.source_url ? (
            <a
              href={content.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary transition-colors hover:text-primary/80"
            >
              {content.source_url}
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : (
            <p className="text-foreground-muted">{content.source_text}</p>
          )}
          {formattedDate && (
            <p className="mt-2 text-sm text-foreground-muted">Created: {formattedDate}</p>
          )}
        </div>

        {/* Generated Content */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground">Generated Content</h2>

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
                        {Icon && <Icon className="h-5 w-5 text-primary" />}
                        <h3 className="font-semibold text-foreground">
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
                    <div className="rounded-lg bg-background-tertiary p-4">
                      <p className="whitespace-pre-wrap text-sm text-foreground">
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
