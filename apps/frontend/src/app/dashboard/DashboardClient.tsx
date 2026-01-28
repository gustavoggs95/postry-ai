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
  Plus,
  Link as LinkIcon,
  Zap,
  ChevronRight,
  TrendingUp,
  Clock,
  Video,
} from 'lucide-react';
import UserDropdown from '@/components/UserDropdown';

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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  return (
    <div className="bg-background flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-background-secondary border-border flex flex-col border-r transition-all duration-300`}
      >
        {/* Logo */}
        <div className="border-border flex h-16 items-center gap-2 border-b px-4">
          <div className="bg-gradient-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          {sidebarOpen && <span className="text-foreground text-xl font-bold">Postry AI</span>}
        </div>

        {/* Navigation */}
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
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        <div className="border-border border-t p-4">
          <UserDropdown user={user} position="top" />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
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
            <div className="card">
              <div className="py-12 text-center">
                <div className="bg-background-tertiary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
                  <FileText className="text-foreground-muted h-8 w-8" />
                </div>
                <h3 className="text-foreground mb-2 text-lg font-medium">No content yet</h3>
                <p className="text-foreground-muted mb-4">
                  Start by generating content from a URL or creating a brand preset
                </p>
                <button className="btn-primary">
                  <Plus className="mr-2 h-4 w-4" />
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
