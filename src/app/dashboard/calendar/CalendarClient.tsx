'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import {
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

const platformConfig: Record<string, { icon: typeof Linkedin; color: string; label: string }> = {
  linkedin: { icon: Linkedin, color: 'bg-blue-600', label: 'LinkedIn' },
  twitter: { icon: Twitter, color: 'bg-sky-500', label: 'Twitter' },
  instagram: { icon: Instagram, color: 'bg-pink-500', label: 'Instagram' },
  tiktok: { icon: Video, color: 'bg-purple-500', label: 'TikTok' },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function CalendarClient({
  initialScheduledContent,
  availableContent,
}: CalendarClientProps) {
  const supabase = createClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduledContent, setScheduledContent] =
    useState<ScheduledContent[]>(initialScheduledContent);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedContent, setSelectedContent] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState('09:00');

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

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-border px-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Content Calendar</h1>
          <p className="text-sm text-foreground-muted">
            Schedule and manage your content publishing
          </p>
        </div>
      </header>

      <div className="p-6">
        {/* Calendar Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-background-tertiary hover:text-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="btn-secondary text-sm">
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-background-tertiary hover:text-foreground"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="card overflow-hidden p-0">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {DAYS.map((day) => (
              <div
                key={day}
                className="border-r border-border p-3 text-center text-sm font-medium text-foreground-muted last:border-r-0"
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
                  className={`min-h-[120px] border-b border-r border-border p-2 last:border-r-0 ${
                    date ? 'cursor-pointer hover:bg-background-tertiary' : 'bg-background-secondary'
                  }`}
                  onClick={() => date && handleDateClick(date)}
                >
                  {date && (
                    <>
                      <div
                        className={`mb-1 flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                          isToday ? 'bg-primary font-bold text-white' : 'text-foreground'
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
                              className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-xs ${config?.color || 'bg-gray-500'} text-white`}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <Icon className="h-3 w-3" />
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
                                className="ml-auto rounded p-0.5 hover:bg-white/20"
                              >
                                <X className="h-3 w-3" />
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

      {/* Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative m-4 w-full max-w-md rounded-2xl border border-border bg-background-secondary shadow-2xl">
            <div className="flex items-center justify-between border-b border-border p-6">
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
                className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-background-tertiary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              {availableContent.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="mb-3 text-foreground-muted">No content available to schedule</p>
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
                            className={`flex items-center gap-2 rounded-lg border p-3 transition-colors ${
                              selectedPlatform === key
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-border-light'
                            }`}
                          >
                            <div
                              className={`h-6 w-6 rounded ${config.color} flex items-center justify-center`}
                            >
                              <Icon className="h-3 w-3 text-white" />
                            </div>
                            <span
                              className={
                                selectedPlatform === key ? 'text-primary' : 'text-foreground'
                              }
                            >
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
                      <Clock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground-muted" />
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
                    <button onClick={() => setIsModalOpen(false)} className="btn-secondary">
                      Cancel
                    </button>
                    <button
                      onClick={handleSchedule}
                      disabled={!selectedContent || !selectedPlatform}
                      className="btn-primary"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Schedule
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
