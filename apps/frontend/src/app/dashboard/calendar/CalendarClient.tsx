'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import {
  Sparkles,
  LayoutDashboard,
  Palette,
  FileText,
  Calendar as CalendarIcon,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  Linkedin,
  Twitter,
  Instagram,
  Video,
  X,
  Clock,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Content } from '@/lib/stores';

interface ScheduledContent {
  id: string;
  content_id: string;
  platform: string;
  scheduled_at: string;
  status: string;
  content?: Content;
}

interface CalendarClientProps {
  user: User;
  initialScheduledContent: ScheduledContent[];
  availableContent: Content[];
}

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Sparkles, label: 'Generate', href: '/dashboard/generate' },
  { icon: Palette, label: 'Brand Presets', href: '/dashboard/brands' },
  { icon: FileText, label: 'Content', href: '/dashboard/content' },
  { icon: CalendarIcon, label: 'Calendar', href: '/dashboard/calendar', active: true },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

const platformConfig: Record<string, { icon: typeof Linkedin; color: string; label: string }> = {
  linkedin: { icon: Linkedin, color: 'bg-blue-600', label: 'LinkedIn' },
  twitter: { icon: Twitter, color: 'bg-sky-500', label: 'Twitter' },
  instagram: { icon: Instagram, color: 'bg-pink-500', label: 'Instagram' },
  tiktok: { icon: Video, color: 'bg-purple-500', label: 'TikTok' },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function CalendarClient({
  user,
  initialScheduledContent,
  availableContent,
}: CalendarClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduledContent, setScheduledContent] = useState<ScheduledContent[]>(initialScheduledContent);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedContent, setSelectedContent] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState('09:00');

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before the first of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getScheduledForDate = (date: Date) => {
    return scheduledContent.filter((item) => {
      const itemDate = new Date(item.scheduled_at);
      return (
        itemDate.getDate() === date.getDate() &&
        itemDate.getMonth() === date.getMonth() &&
        itemDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleSchedule = async () => {
    if (!selectedDate || !selectedContent || !selectedPlatform) return;

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const scheduledAt = new Date(selectedDate);
    scheduledAt.setHours(hours, minutes, 0, 0);

    const { data, error } = await supabase
      .from('scheduled_content')
      .insert({
        content_id: selectedContent,
        platform: selectedPlatform,
        scheduled_at: scheduledAt.toISOString(),
        status: 'pending',
      })
      .select('*, content(*, brands(name))')
      .single();

    if (!error && data) {
      setScheduledContent([...scheduledContent, data]);
      setIsModalOpen(false);
      setSelectedContent('');
      setSelectedPlatform('');
      setSelectedTime('09:00');
    }
  };

  const handleRemoveScheduled = async (id: string) => {
    const { error } = await supabase.from('scheduled_content').delete().eq('id', id);
    if (!error) {
      setScheduledContent(scheduledContent.filter((item) => item.id !== id));
    }
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date();
  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

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
            <h1 className="text-xl font-semibold text-foreground">Content Calendar</h1>
            <p className="text-sm text-foreground-muted">
              Schedule and manage your content publishing
            </p>
          </div>
        </header>

        <div className="p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-lg hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="btn-secondary text-sm"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-lg hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="card p-0 overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-border">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="p-3 text-center text-sm font-medium text-foreground-muted border-r border-border last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {days.map((date, index) => {
                const isToday =
                  date &&
                  date.getDate() === today.getDate() &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear();
                const scheduled = date ? getScheduledForDate(date) : [];

                return (
                  <div
                    key={index}
                    className={`min-h-[120px] p-2 border-r border-b border-border last:border-r-0 ${
                      date ? 'hover:bg-background-tertiary cursor-pointer' : 'bg-background-secondary'
                    }`}
                    onClick={() => date && handleDateClick(date)}
                  >
                    {date && (
                      <>
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-sm mb-1 ${
                            isToday
                              ? 'bg-primary text-white font-bold'
                              : 'text-foreground'
                          }`}
                        >
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {scheduled.slice(0, 3).map((item) => {
                            const config = platformConfig[item.platform];
                            const Icon = config?.icon || FileText;
                            return (
                              <div
                                key={item.id}
                                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${config?.color || 'bg-gray-500'} text-white`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                <Icon className="w-3 h-3" />
                                <span className="truncate">
                                  {new Date(item.scheduled_at).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                  })}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveScheduled(item.id);
                                  }}
                                  className="ml-auto hover:bg-white/20 rounded p-0.5"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })}
                          {scheduled.length > 3 && (
                            <div className="text-xs text-foreground-muted">
                              +{scheduled.length - 3} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-background-secondary rounded-2xl border border-border shadow-2xl m-4">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Schedule Content</h2>
                <p className="text-sm text-foreground-muted">
                  {selectedDate?.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {availableContent.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-foreground-muted mb-3">No content available to schedule</p>
                  <a href="/dashboard/generate" className="btn-primary inline-flex">
                    Generate Content
                  </a>
                </div>
              ) : (
                <>
                  {/* Content Selection */}
                  <div>
                    <label className="label">Select Content</label>
                    <select
                      value={selectedContent}
                      onChange={(e) => setSelectedContent(e.target.value)}
                      className="input"
                    >
                      <option value="">Choose content...</option>
                      {availableContent.map((content) => (
                        <option key={content.id} value={content.id}>
                          {content.brands?.name || 'No brand'} -{' '}
                          {content.source_url
                            ? new URL(content.source_url).hostname
                            : content.source_text?.substring(0, 30)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Platform Selection */}
                  <div>
                    <label className="label">Platform</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(platformConfig).map(([key, config]) => {
                        const Icon = config.icon;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setSelectedPlatform(key)}
                            className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                              selectedPlatform === key
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-border-light'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded ${config.color} flex items-center justify-center`}>
                              <Icon className="w-3 h-3 text-white" />
                            </div>
                            <span className={selectedPlatform === key ? 'text-primary' : 'text-foreground'}>
                              {config.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div>
                    <label className="label">Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                      <input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="input pl-10"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSchedule}
                      disabled={!selectedContent || !selectedPlatform}
                      className="btn-primary"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Schedule
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
