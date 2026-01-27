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

const statusConfig: Record<
  ContentStatus,
  { label: string; color: string; icon: typeof Clock }
> = {
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
    const { error } = await supabase
      .from('content')
      .update({ status })
      .eq('id', id);
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
            <h1 className="text-xl font-semibold text-foreground">Content Library</h1>
            <p className="text-sm text-foreground-muted">
              Manage all your generated content
            </p>
          </div>
          <a href="/dashboard/generate" className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            New Content
          </a>
        </header>

        <div className="p-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
              <input
                type="text"
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-foreground-muted" />
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
            <div className="card text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-background-tertiary mx-auto mb-4 flex items-center justify-center">
                <FileText className="w-8 h-8 text-foreground-muted" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchQuery || statusFilter !== 'all' ? 'No content found' : 'No content yet'}
              </h3>
              <p className="text-foreground-muted mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Start generating content to see it here'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <a href="/dashboard/generate" className="btn-primary inline-flex">
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Content
                </a>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContent.map((content) => {
                const StatusIcon = statusConfig[content.status].icon;
                const platforms = Object.keys(content.generated_content || {});

                return (
                  <div key={content.id} className="card group relative">
                    {/* Menu Button */}
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === content.id ? null : content.id)}
                        className="p-1 rounded-lg hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {openMenuId === content.id && (
                        <div className="absolute right-0 top-8 w-48 bg-background-secondary border border-border rounded-lg shadow-xl z-10">
                          <button
                            onClick={() => router.push(`/dashboard/content/${content.id}`)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-background-tertiary transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit Content
                          </button>
                          {content.status === 'draft' && (
                            <button
                              onClick={() => handleStatusChange(content.id, 'approved')}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-background-tertiary transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Mark as Approved
                            </button>
                          )}
                          {content.status === 'approved' && (
                            <button
                              onClick={() => handleStatusChange(content.id, 'published')}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-background-tertiary transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Mark as Published
                            </button>
                          )}
                          <button
                            onClick={() => handleStatusChange(content.id, 'archived')}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-background-tertiary transition-colors"
                          >
                            <Archive className="w-4 h-4" />
                            Archive
                          </button>
                          <button
                            onClick={() => handleDelete(content.id)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-error hover:bg-error/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Cover Image */}
                    {content.cover_image_url && (
                      <div className="mb-4 -mx-6 -mt-6">
                        <img
                          src={content.cover_image_url}
                          alt="Cover"
                          className="w-full h-32 object-cover rounded-t-xl"
                        />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[content.status].color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig[content.status].label}
                      </span>
                      {content.brands?.name && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                          {content.brands.name}
                        </span>
                      )}
                    </div>

                    {/* Source */}
                    <div className="mb-3">
                      {content.source_url ? (
                        <p className="text-sm text-foreground truncate">
                          {new URL(content.source_url).hostname}
                        </p>
                      ) : (
                        <p className="text-sm text-foreground line-clamp-2">
                          {content.source_text?.substring(0, 100)}...
                        </p>
                      )}
                    </div>

                    {/* Platforms */}
                    <div className="flex items-center gap-2 mb-3">
                      {platforms.map((platform) => {
                        const Icon = platformIcons[platform] || FileText;
                        return (
                          <div
                            key={platform}
                            className="w-6 h-6 rounded bg-background-tertiary flex items-center justify-center"
                            title={platform}
                          >
                            <Icon className="w-3 h-3 text-foreground-muted" />
                          </div>
                        );
                      })}
                    </div>

                    {/* Date */}
                    <p className="text-xs text-foreground-muted">
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
