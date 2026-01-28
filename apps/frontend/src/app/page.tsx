'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Zap, Calendar, Palette, FileText, Video, ArrowRight, Check } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import UserDropdown from '@/components/UserDropdown';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Generation',
    description:
      'Transform any blog URL into LinkedIn posts, TikTok scripts, and cover images automatically.',
  },
  {
    icon: Palette,
    title: 'Brand Voice Presets',
    description:
      'Save your brand style once. Our AI remembers your tone, style, and preferences every time.',
  },
  {
    icon: FileText,
    title: 'Approval Workflow',
    description:
      'Edit, review, and approve content before publishing. Track versions and content status.',
  },
  {
    icon: Calendar,
    title: 'Content Calendar',
    description: 'Visualize and schedule your content with a drag-and-drop calendar interface.',
  },
  {
    icon: Video,
    title: 'Asset Transformation',
    description:
      'Upload videos and get transcriptions, tweet threads, blog articles, and Reels ideas.',
  },
  {
    icon: Zap,
    title: 'One-Click Publishing',
    description:
      'Connect your social accounts and publish directly to LinkedIn, Twitter, and more.',
  },
];

const benefits = [
  'No more repeating brand tone in every prompt',
  'Organized projects, not infinite chat histories',
  'Single workflow for text, scripts, and images',
  'Real agency-style approval process',
];

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const openAuthModal = (view: 'login' | 'signup') => {
    setAuthView(view);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="bg-gradient-dark min-h-screen">
      {/* Navigation */}
      <nav className="glass fixed left-0 right-0 top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-primary flex h-8 w-8 items-center justify-center rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-foreground text-xl font-bold">Postry AI</span>
            </div>
            <div className="flex items-center gap-4">
              {loading ? (
                <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-800"></div>
              ) : user ? (
                <>
                  <Link href="/dashboard" className="btn-primary">
                    Go to Dashboard
                  </Link>
                  <UserDropdown user={user} />
                </>
              ) : (
                <>
                  <button onClick={() => openAuthModal('login')} className="btn-ghost">
                    Sign In
                  </button>
                  <button onClick={() => openAuthModal('signup')} className="btn-primary">
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 pb-20 pt-32">
        <div className="mx-auto max-w-7xl text-center">
          <div className="bg-primary/10 border-primary/20 mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2">
            <Sparkles className="text-primary h-4 w-4" />
            <span className="text-primary text-sm">Automated Content Factory</span>
          </div>
          <h1 className="text-foreground mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Transform Content Into
            <span className="gradient-text mt-2 block">Multi-Platform Magic</span>
          </h1>
          <p className="text-foreground-muted mx-auto mb-10 max-w-2xl text-xl">
            Paste a blog URL and let AI generate LinkedIn posts, TikTok scripts, and cover images.
            All with your brand voice, automatically.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => openAuthModal('signup')}
              className="btn-primary px-8 py-3 text-lg"
            >
              Start Creating Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <Link href="#features" className="btn-secondary px-8 py-3 text-lg">
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="card bg-background-secondary border-border-light overflow-hidden">
            <div className="mb-4 flex items-center gap-2">
              <div className="bg-error h-3 w-3 rounded-full" />
              <div className="bg-warning h-3 w-3 rounded-full" />
              <div className="bg-success h-3 w-3 rounded-full" />
            </div>
            <div className="bg-background flex min-h-[300px] items-center justify-center rounded-lg p-6">
              <div className="text-center">
                <div className="bg-gradient-primary animate-pulse-glow mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <p className="text-foreground-muted">Interactive demo coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-background-secondary px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-foreground mb-4 text-3xl font-bold sm:text-4xl">
              Why Postry AI vs. ChatGPT?
            </h2>
            <p className="text-foreground-muted mx-auto max-w-2xl">
              Stop copy-pasting between chats. Get a purpose-built content factory.
            </p>
          </div>
          <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-background border-border flex items-center gap-3 rounded-lg border p-4"
              >
                <div className="bg-success/20 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full">
                  <Check className="text-success h-4 w-4" />
                </div>
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-foreground mb-4 text-3xl font-bold sm:text-4xl">
              Everything You Need to Scale Content
            </h2>
            <p className="text-foreground-muted mx-auto max-w-2xl">
              From idea to published post, all in one workflow.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="card group">
                <div className="bg-primary/10 group-hover:bg-primary/20 mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-colors">
                  <feature.icon className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-foreground mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-foreground-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="card bg-gradient-primary p-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Ready to Automate Your Content?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-white/80">
              Join creators and brands who are scaling their social presence with AI.
            </p>
            <button
              onClick={() => openAuthModal('signup')}
              className="text-primary inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 font-semibold transition-colors hover:bg-white/90"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-border border-t px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-primary flex h-8 w-8 items-center justify-center rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-foreground text-lg font-bold">Postry AI</span>
            </div>
            <p className="text-foreground-muted text-sm">© 2026 Postry AI. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialView={authView}
      />
    </div>
  );
}
