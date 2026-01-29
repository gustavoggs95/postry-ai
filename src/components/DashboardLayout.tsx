'use client';

import { User } from '@supabase/supabase-js';
import {
  Sparkles,
  LayoutDashboard,
  Palette,
  FileText,
  Calendar,
  Settings,
  Video,
} from 'lucide-react';
import UserDropdown from './UserDropdown';

interface DashboardLayoutProps {
  user: User;
  children: React.ReactNode;
  activeItem?: string;
}

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', id: 'dashboard' },
  { icon: Sparkles, label: 'Generate', href: '/dashboard/generate', id: 'generate' },
  { icon: Video, label: 'Assets', href: '/dashboard/assets', id: 'assets' },
  { icon: Palette, label: 'Brand Presets', href: '/dashboard/brands', id: 'brands' },
  { icon: FileText, label: 'Content', href: '/dashboard/content', id: 'content' },
  { icon: Calendar, label: 'Calendar', href: '/dashboard/calendar', id: 'calendar' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings', id: 'settings' },
];

export default function DashboardLayout({ user, children, activeItem }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-border bg-background-secondary">
        <div className="flex h-16 items-center gap-3 border-b border-border px-4">
          <img src="/images/postry-icon.png" alt="Postry AI" className="h-10 w-auto" />
          <span className="text-xl font-bold text-foreground">Postry AI</span>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                    item.id === activeItem
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

        <div className="border-t border-border p-4">
          <UserDropdown user={user} position="top" />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
