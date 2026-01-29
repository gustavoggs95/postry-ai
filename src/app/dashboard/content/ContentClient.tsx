'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  Archive,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useContentStore, Content, ContentStatus } from '@/lib/stores';
import ContentCard from '@/components/ContentCard';
import ContentCardSkeleton from '@/components/ContentCardSkeleton';

interface ContentClientProps {
  user: User;
  initialContent: Content[];
}

const statusConfig: Record<ContentStatus, { label: string; color: string; icon: typeof Clock }> = {
  draft: { label: 'Draft', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  approved: { label: 'Approved', color: 'bg-blue-500/20 text-blue-400', icon: CheckCircle },
  published: { label: 'Published', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  archived: { label: 'Archived', color: 'bg-gray-500/20 text-gray-400', icon: Archive },
};

export default function ContentClient({ user, initialContent }: ContentClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const { contents, setContents, deleteContent, updateContent } = useContentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'all'>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setContents(initialContent);
    setLoading(false);
  }, [initialContent, setContents]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('content').delete().eq('id', id);
    if (!error) {
      deleteContent(id);
    }
    setOpenMenuId(null);
  };

  const handleStatusChange = async (id: string, status: ContentStatus) => {
    const { error } = await supabase.from('content').update({ status }).eq('id', id);
    if (!error) {
      updateContent(id, { status });
    }
    setOpenMenuId(null);
  };

  const filteredContent = contents.filter((content) => {
    const matchesSearch =
      content.source_url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.source_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.brands?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || content.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <header className="border-border flex h-16 items-center justify-between border-b px-6">
        <div>
          <h1 className="text-foreground text-xl font-semibold">Content Library</h1>
          <p className="text-foreground-muted text-sm">Manage all your generated content</p>
        </div>
        <a href="/dashboard/generate" className="btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          New Content
        </a>
      </header>

      <div className="p-6">
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative max-w-md flex-1">
            <Search className="text-foreground-muted absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-foreground-muted h-5 w-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ContentStatus | 'all')}
              className="input w-auto"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="approved">Approved</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <ContentCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredContent.length === 0 ? (
          <div className="card py-12 text-center">
            <div className="bg-background-tertiary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
              <FileText className="text-foreground-muted h-8 w-8" />
            </div>
            <h3 className="text-foreground mb-2 text-lg font-medium">
              {searchQuery || statusFilter !== 'all' ? 'No content found' : 'No content yet'}
            </h3>
            <p className="text-foreground-muted mb-4">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Start generating content to see it here'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <a href="/dashboard/generate" className="btn-primary inline-flex">
                <Plus className="mr-2 h-4 w-4" />
                Generate Content
              </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredContent.map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                onClick={() => router.push(`/dashboard/content/${content.id}`)}
                menu={
                  <div className="absolute right-4 top-4 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === content.id ? null : content.id);
                      }}
                      className="hover:bg-background-tertiary text-foreground-muted hover:text-foreground rounded-lg p-1 transition-colors"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>

                    {openMenuId === content.id && (
                      <div className="bg-background-secondary border-border absolute right-0 top-8 z-10 w-48 rounded-lg border shadow-xl">
                        <button
                          onClick={() => router.push(`/dashboard/content/${content.id}`)}
                          className="text-foreground hover:bg-background-tertiary flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit Content
                        </button>
                        {content.status === 'draft' && (
                          <button
                            onClick={() => handleStatusChange(content.id, 'approved')}
                            className="text-foreground hover:bg-background-tertiary flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Mark as Approved
                          </button>
                        )}
                        {content.status === 'approved' && (
                          <button
                            onClick={() => handleStatusChange(content.id, 'published')}
                            className="text-foreground hover:bg-background-tertiary flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Mark as Published
                          </button>
                        )}
                        <button
                          onClick={() => handleStatusChange(content.id, 'archived')}
                          className="text-foreground hover:bg-background-tertiary flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                        >
                          <Archive className="h-4 w-4" />
                          Archive
                        </button>
                        <button
                          onClick={() => handleDelete(content.id)}
                          className="text-error hover:bg-error/10 flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                }
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
