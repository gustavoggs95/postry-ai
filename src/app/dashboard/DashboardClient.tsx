'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import {
  Plus,
  Link as LinkIcon,
  Zap,
  ChevronRight,
  TrendingUp,
  Clock,
  FileText,
  Palette,
} from 'lucide-react';
import ContentCard from '@/components/ContentCard';
import ContentCardSkeleton from '@/components/ContentCardSkeleton';
import { createClient } from '@/lib/supabase/client';

interface DashboardClientProps {
  user: User;
}

export default function DashboardClient({ user: initialUser }: DashboardClientProps) {
  const router = useRouter();
  const [user, setUser] = useState<User>(initialUser);
  const [recentContent, setRecentContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    contentGenerated: 0,
    postsScheduled: 0,
    brandsCreated: 0,
    timeSaved: 0,
  });

  useEffect(() => {
    const supabase = createClient();

    // Fetch recent content and stats
    const fetchData = async () => {
      // Fetch recent content
      const { data: contentData } = await supabase
        .from('content')
        .select('*, brands(name)')
        .order('created_at', { ascending: false })
        .limit(6);

      setRecentContent(contentData || []);

      // Fetch stats
      const [{ count: totalContent }, { count: scheduledContent }, { count: totalBrands }] =
        await Promise.all([
          supabase.from('content').select('*', { count: 'exact', head: true }),
          supabase
            .from('content')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'scheduled'),
          supabase.from('brands').select('*', { count: 'exact', head: true }),
        ]);

      // Calculate time saved (assuming 30 minutes saved per content piece)
      const timeSavedHours = Math.round(((totalContent || 0) * 30) / 60);

      setStats({
        contentGenerated: totalContent || 0,
        postsScheduled: scheduledContent || 0,
        brandsCreated: totalBrands || 0,
        timeSaved: timeSavedHours,
      });

      setLoading(false);
    };

    fetchData();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        router.push('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  const statsDisplay = [
    {
      label: 'Content Generated',
      value: stats.contentGenerated.toString(),
      icon: FileText,
    },
    {
      label: 'Posts Scheduled',
      value: stats.postsScheduled.toString(),
      icon: Clock,
    },
    {
      label: 'Brands Created',
      value: stats.brandsCreated.toString(),
      icon: Palette,
    },
    {
      label: 'Time Saved',
      value: `${stats.timeSaved}h`,
      icon: TrendingUp,
    },
  ];

  return (
    <>
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-border px-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-foreground-muted">Welcome back, {userName}!</p>
        </div>
        <button onClick={() => router.push('/dashboard/generate')} className="btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          New Content
        </button>
      </header>

      {/* Content */}
      <div className="p-6">
        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsDisplay.map((stat) => (
            <div key={stat.label} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-foreground-muted">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Generate from URL */}
            <div
              onClick={() => router.push('/dashboard/generate')}
              className="card group flex cursor-pointer items-center hover:border-primary/50"
            >
              <div className="flex w-full items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary">
                  <LinkIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
                    Generate from URL
                  </h3>
                  <p className="text-sm text-foreground-muted">
                    Paste a blog article URL to generate content
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 flex-shrink-0 text-foreground-muted transition-colors group-hover:text-primary" />
              </div>
            </div>

            {/* Create Brand */}
            <div
              onClick={() => router.push('/dashboard/brands')}
              className="card group flex cursor-pointer items-center hover:border-primary/50"
            >
              <div className="flex w-full items-center gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-accent/20">
                  <Palette className="h-6 w-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
                    Create Brand Preset
                  </h3>
                  <p className="text-sm text-foreground-muted">
                    Save your brand voice for consistent content
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 flex-shrink-0 text-foreground-muted transition-colors group-hover:text-primary" />
              </div>
            </div>

            {/* Transform Video */}
            <div
              onClick={() => router.push('/dashboard/assets')}
              className="card group flex cursor-pointer items-center hover:border-primary/50"
            >
              <div className="flex w-full items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/20">
                  <Zap className="h-6 w-6 text-success" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
                    Transform Video
                  </h3>
                  <p className="text-sm text-foreground-muted">
                    Upload a video to repurpose into multiple formats
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-foreground-muted transition-colors group-hover:text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Content */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Content</h2>
          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <ContentCardSkeleton key={i} />
              ))}
            </div>
          ) : recentContent.length === 0 ? (
            <div className="card py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-background-tertiary">
                <FileText className="h-8 w-8 text-foreground-muted" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-foreground">No content yet</h3>
              <p className="mb-4 text-foreground-muted">
                Start by generating content from a URL or creating a brand preset
              </p>
              <button onClick={() => router.push('/dashboard/generate')} className="btn-primary">
                <Plus className="mr-2 h-4 w-4" />
                Generate Your First Content
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentContent.map((content) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  onClick={() => router.push(`/dashboard/content/${content.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
