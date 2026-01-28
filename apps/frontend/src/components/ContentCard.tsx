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
      className="card hover:border-primary/50 group relative cursor-pointer transition-all"
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
        <div className="bg-background-tertiary -mx-6 -mt-6 mb-4 flex h-32 items-center justify-center rounded-t-xl">
          <FileText className="text-foreground-muted h-12 w-12" />
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
        {content.brands?.name && (
          <span className="bg-primary/20 text-primary rounded-full px-2 py-1 text-xs font-medium">
            {content.brands.name}
          </span>
        )}
      </div>

      {/* Source */}
      <div className="mb-3">
        {content.source_url ? (
          <p className="text-foreground truncate text-sm font-medium">
            {new URL(content.source_url).hostname}
          </p>
        ) : (
          <p className="text-foreground line-clamp-2 text-sm">
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
              className="bg-background-tertiary flex h-6 w-6 items-center justify-center rounded"
              title={platform}
            >
              <Icon className="text-foreground-muted h-3 w-3" />
            </div>
          );
        })}
      </div>

      {/* Date */}
      <p className="text-foreground-muted text-xs">
        {new Date(content.created_at).toLocaleDateString()}
      </p>
    </div>
  );
}
