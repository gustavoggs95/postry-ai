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
  LogOut,
  Plus,
  Link as LinkIcon,
  Zap,
  ChevronRight,
  TrendingUp,
  Clock,
  Video,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface DashboardClientProps {
  user: User;
}

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', active: true },
  { icon: Sparkles, label: 'Generate', href: '/dashboard/generate' },
  { icon: Video, label: 'Assets', href: '/dashboard/assets' },
  { icon: Palette, label: 'Brand Presets', href: '/dashboard/brands' },
  { icon: FileText, label: 'Content', href: '/dashboard/content' },
  { icon: Calendar, label: 'Calendar', href: '/dashboard/calendar' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

const stats = [
  { label: 'Content Generated', value: '0', icon: FileText, trend: '+0%' },
  { label: 'Posts Scheduled', value: '0', icon: Clock, trend: '+0%' },
  { label: 'Brands Created', value: '0', icon: Palette, trend: '+0%' },
  { label: 'Time Saved', value: '0h', icon: TrendingUp, trend: '+0%' },
];

export default function DashboardClient({ user }: DashboardClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-background-secondary border-r border-border transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-2 px-4 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && <span className="text-xl font-bold text-foreground">Postry AI</span>}
        </div>

        {/* Navigation */}
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
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-medium">{userName.charAt(0).toUpperCase()}</span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{userName}</p>
                <p className="text-xs text-foreground-muted truncate">{user.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-foreground-muted hover:bg-background-tertiary hover:text-foreground transition-colors w-full ${!sidebarOpen && 'justify-center'}`}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-sm text-foreground-muted">Welcome back, {userName}!</p>
          </div>
          <button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            New Content
          </button>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-foreground-muted text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-success mt-2">{stat.trend} from last month</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Generate from URL */}
              <div className="card group cursor-pointer hover:border-primary/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                    <LinkIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      Generate from URL
                    </h3>
                    <p className="text-sm text-foreground-muted">
                      Paste a blog article URL to generate content
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-foreground-muted group-hover:text-primary transition-colors" />
                </div>
              </div>

              {/* Create Brand */}
              <div className="card group cursor-pointer hover:border-primary/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Palette className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      Create Brand Preset
                    </h3>
                    <p className="text-sm text-foreground-muted">
                      Save your brand voice for consistent content
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-foreground-muted group-hover:text-primary transition-colors" />
                </div>
              </div>

              {/* Transform Video */}
              <div className="card group cursor-pointer hover:border-primary/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-success" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      Transform Video
                    </h3>
                    <p className="text-sm text-foreground-muted">
                      Upload a video to repurpose into multiple formats
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-foreground-muted group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Content */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Recent Content</h2>
            <div className="card">
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-background-tertiary mx-auto mb-4 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-foreground-muted" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No content yet</h3>
                <p className="text-foreground-muted mb-4">
                  Start by generating content from a URL or creating a brand preset
                </p>
                <button className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Your First Content
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
