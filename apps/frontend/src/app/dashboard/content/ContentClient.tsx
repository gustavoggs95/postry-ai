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
  Linkedin,
  Twitter,
  Instagram,
  Video,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useContentStore, Content, ContentStatus } from '@/lib/stores';

interface ContentClientProps {
  user: User;
  initialContent: Content[];
}

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Sparkles, label: 'Generate', href: '/dashboard/generate' },
  { icon: Palette, label: 'Brand Presets', href: '/dashboard/brands' },
  { icon: FileText, label: 'Content', href: '/dashboard/content', active: true },
  { icon: Calendar, label: 'Calendar', href: '/dashboard/calendar' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

const statusConfig: Record<ContentStatus, { label: string; color: string; icon: typeof Clock }> = {
  draft: { label: 'Draft', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  approved: { label: 'Approved', color: 'bg-blue-500/20 text-blue-400', icon: CheckCircle },
  published: { label: 'Published', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  archived: { label: 'Archived', color: 'bg-gray-500/20 text-gray-400', icon: Archive },
};

const platformIcons: Record<string, typeof Linkedin> = {
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
  tiktok: Video,
};

export default function ContentClient({ user, initialContent }: ContentClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const { contents, setContents, deleteContent, updateContent } = useContentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'all'>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    setContents(initialContent);
  }, [initialContent, setContents]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

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

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

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
          {filteredContent.length === 0 ? (
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
              {filteredContent.map((content) => {
                const StatusIcon = statusConfig[content.status].icon;
                const platforms = Object.keys(content.generated_content || {});

                return (
                  <div key={content.id} className="card group relative">
                    {/* Menu Button */}
                    <div className="absolute right-4 top-4">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === content.id ? null : content.id)}
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

                    {/* Cover Image */}
                    {content.cover_image_url && (
                      <div className="-mx-6 -mt-6 mb-4">
                        <img
                          src={content.cover_image_url}
                          alt="Cover"
                          className="h-32 w-full rounded-t-xl object-cover"
                        />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="mb-3 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusConfig[content.status].color}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig[content.status].label}
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
                        <p className="text-foreground truncate text-sm">
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
                      Created {formatDate(content.created_at)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
