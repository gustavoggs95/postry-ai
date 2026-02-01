'use client';

import { User } from '@supabase/supabase-js';
import { Construction, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SettingsClientProps {
  user: User;
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const router = useRouter();

  return (
    <>
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-border px-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-foreground-muted">Manage your account and preferences</p>
        </div>
      </header>

      {/* Content */}
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        <div className="card max-w-md py-12 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-primary">
            <Construction className="h-10 w-10 text-white" />
          </div>
          <h2 className="mb-3 text-2xl font-bold text-foreground">Under Construction</h2>
          <p className="mb-6 text-foreground-muted">
            {user.email} <br /> Check back soon for updates!
          </p>
          <button onClick={() => router.push('/dashboard')} className="btn-secondary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </>
  );
}
