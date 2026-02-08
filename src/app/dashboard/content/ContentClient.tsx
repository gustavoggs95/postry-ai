'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ExternalLink,
  FileText,
  CheckCircle,
  Archive,
  Pencil,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useContentStore, Content, ContentStatus } from '@/lib/stores';
import ContentCard from '@/components/ContentCard';
import ContentCardSkeleton from '@/components/ContentCardSkeleton';

interface ContentClientProps {
  initialContent: Content[];
}

export default function ContentClient({ initialContent }: ContentClientProps) {
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
    if (error) {
      toast.error('Failed to delete content');
    } else {
      deleteContent(id);
      toast.success('Content deleted successfully');
    }
    setOpenMenuId(null);
  };

  const handleStatusChange = async (id: string, status: ContentStatus) => {
    const { error } = await supabase.from('content').update({ status }).eq('id', id);
    if (error) {
      toast.error('Failed to update status');
    } else {
      updateContent(id, { status });
      toast.success(`Content marked as ${status}`);
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
      <header className="flex h-16 items-center justify-between border-b border-border px-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Content Library</h1>
          <p className="text-sm text-foreground-muted">Manage all your generated content</p>
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
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-foreground-muted" />
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
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-background-tertiary">
              <FileText className="h-8 w-8 text-foreground-muted" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-foreground">
              {searchQuery || statusFilter !== 'all' ? 'No content found' : 'No content yet'}
            </h3>
            <p className="mb-4 text-foreground-muted">
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
                  <div className="absolute bottom-4 right-4 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === content.id ? null : content.id);
                      }}
                      className="rounded-lg bg-black/40 p-2 text-foreground-muted transition-colors hover:bg-background-tertiary hover:text-foreground"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>

                    {openMenuId === content.id && (
                      <div className="absolute right-0 top-8 z-10 w-48 rounded-lg border border-border bg-background-secondary shadow-xl">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/content/${content.id}`);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-background-tertiary"
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit Content
                        </button>
                        {content.status === 'draft' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(content.id, 'approved');
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-background-tertiary"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Mark as Approved
                          </button>
                        )}
                        {content.status === 'approved' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(content.id, 'published');
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-background-tertiary"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Mark as Published
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(content.id, 'archived');
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-background-tertiary"
                        >
                          <Archive className="h-4 w-4" />
                          Archive
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(content.id);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-error transition-colors hover:bg-error/10"
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
