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
  Video,
  FileText,
  Palette,
} from 'lucide-react';
import ContentCard from '@/components/ContentCard';
import ContentCardSkeleton from '@/components/ContentCardSkeleton';
import { createClient } from '@/lib/supabase/client';

interface DashboardClientProps {
  user: User;
}

const stats = [
  { label: 'Content Generated', value: '0', icon: FileText, trend: '+0%' },
  { label: 'Posts Scheduled', value: '0', icon: Clock, trend: '+0%' },
  { label: 'Brands Created', value: '0', icon: Palette, trend: '+0%' },
  { label: 'Time Saved', value: '0h', icon: TrendingUp, trend: '+0%' },
];

export default function DashboardClient({ user: initialUser }: DashboardClientProps) {
  const router = useRouter();
  const [user, setUser] = useState<User>(initialUser);
  const [recentContent, setRecentContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Fetch recent content
    const fetchContent = async () => {
      const { data } = await supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentContent(data || []);
      setLoading(false);
    };

    fetchContent();

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

  return (
    <>
      {/* Header */}
      <header className="border-border flex h-16 items-center justify-between border-b px-6">
        <div>
          <h1 className="text-foreground text-xl font-semibold">Dashboard</h1>
          <p className="text-foreground-muted text-sm">Welcome back, {userName}!</p>
        </div>
        <button className="btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          New Content
        </button>
      </header>

      {/* Content */}
      <div className="p-6">
        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-foreground-muted text-sm">{stat.label}</p>
                  <p className="text-foreground mt-1 text-3xl font-bold">{stat.value}</p>
                </div>
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                  <stat.icon className="text-primary h-5 w-5" />
                </div>
              </div>
              <p className="text-success mt-2 text-xs">{stat.trend} from last month</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-foreground mb-4 text-lg font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Generate from URL */}
            <div className="card hover:border-primary/50 group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-primary flex h-12 w-12 items-center justify-center rounded-xl">
                  <LinkIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-foreground group-hover:text-primary font-semibold transition-colors">
                    Generate from URL
                  </h3>
                  <p className="text-foreground-muted text-sm">
                    Paste a blog article URL to generate content
                  </p>
                </div>
                <ChevronRight className="text-foreground-muted group-hover:text-primary h-5 w-5 transition-colors" />
              </div>
            </div>

            {/* Create Brand */}
            <div className="card hover:border-primary/50 group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="bg-accent/20 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Palette className="text-accent h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-foreground group-hover:text-primary font-semibold transition-colors">
                    Create Brand Preset
                  </h3>
                  <p className="text-foreground-muted text-sm">
                    Save your brand voice for consistent content
                  </p>
                </div>
                <ChevronRight className="text-foreground-muted group-hover:text-primary h-5 w-5 transition-colors" />
              </div>
            </div>

            {/* Transform Video */}
            <div className="card hover:border-primary/50 group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="bg-success/20 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Zap className="text-success h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-foreground group-hover:text-primary font-semibold transition-colors">
                    Transform Video
                  </h3>
                  <p className="text-foreground-muted text-sm">
                    Upload a video to repurpose into multiple formats
                  </p>
                </div>
                <ChevronRight className="text-foreground-muted group-hover:text-primary h-5 w-5 transition-colors" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Content */}
        <div>
          <h2 className="text-foreground mb-4 text-lg font-semibold">Recent Content</h2>
          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <ContentCardSkeleton key={i} />
              ))}
            </div>
          ) : recentContent.length === 0 ? (
            <div className="card py-12 text-center">
              <div className="bg-background-tertiary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
                <FileText className="text-foreground-muted h-8 w-8" />
              </div>
              <h3 className="text-foreground mb-2 text-lg font-medium">No content yet</h3>
              <p className="text-foreground-muted mb-4">
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
