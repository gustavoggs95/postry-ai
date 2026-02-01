'use client';

import {
  FileText,
  Linkedin,
  Twitter,
  Instagram,
  Video,
  Clock,
  CheckCircle,
  Archive,
} from 'lucide-react';

interface ContentCardProps {
  content: any;
  onClick?: () => void;
  menu?: React.ReactNode;
}

const platformIcons: Record<string, any> = {
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
  tiktok: Video,
};

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  approved: { label: 'Approved', color: 'bg-blue-500/20 text-blue-400', icon: CheckCircle },
  published: { label: 'Published', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  archived: { label: 'Archived', color: 'bg-gray-500/20 text-gray-400', icon: Archive },
};

export default function ContentCard({ content, onClick, menu }: ContentCardProps) {
  const platforms = Object.keys(content.generated_content || {});
  const status = content.status as keyof typeof statusConfig;
  const StatusIcon = statusConfig[status]?.icon || Clock;

  return (
    <div
      onClick={onClick}
      className="card group relative cursor-pointer transition-all hover:border-primary/50"
    >
      {menu}

      {/* Cover Image */}
      {content.cover_image_url ? (
        <div className="-mx-6 -mt-6 mb-4">
          <img
            src={content.cover_image_url}
            alt="Cover"
            className="h-32 w-full rounded-t-xl object-cover"
          />
        </div>
      ) : (
        <div className="-mx-6 -mt-6 mb-4 flex h-32 items-center justify-center rounded-t-xl bg-background-tertiary">
          <FileText className="h-12 w-12 text-foreground-muted" />
        </div>
      )}

      {/* Status Badge */}
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
            statusConfig[status]?.color || statusConfig.draft.color
          }`}
        >
          <StatusIcon className="h-3 w-3" />
          {statusConfig[status]?.label || 'Draft'}
        </span>
        {content.brands?.name ? (
          <span className="rounded-full bg-primary/20 px-2 py-1 text-xs font-medium text-primary">
            {content.brands.name}
          </span>
        ) : (
          <span className="rounded-full bg-primary/20 px-2 py-1 text-xs font-medium text-primary">
            Default
          </span>
        )}
      </div>

      {/* Source */}
      <div className="mb-3">
        {content.source_url ? (
          <p className="truncate text-sm font-medium text-foreground">
            {new URL(content.source_url).hostname}
          </p>
        ) : (
          <p className="line-clamp-2 text-sm text-foreground">
            {content.source_text?.substring(0, 100)}...
          </p>
        )}
      </div>

      {/* Platforms */}
      <div className="mb-3 flex items-center gap-2">
        {platforms.map((platform) => {
          const Icon = platformIcons[platform] || FileText;
          return (
            <div
              key={platform}
              className="flex h-6 w-6 items-center justify-center rounded bg-background-tertiary"
              title={platform}
            >
              <Icon className="h-3 w-3 text-foreground-muted" />
            </div>
          );
        })}
      </div>

      {/* Date */}
      <p className="text-xs text-foreground-muted">
        {new Date(content.created_at).toLocaleDateString()}
      </p>
    </div>
  );
}
