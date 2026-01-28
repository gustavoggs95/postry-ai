'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Mail, Lock, User, Chrome, Loader2, Check, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const [view, setView] = useState<'login' | 'signup'>(
    searchParams.get('view') === 'signup' ? 'signup' : 'login'
  );
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (view === 'login') {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        router.push('/dashboard');
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
      }
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const toggleView = () => {
    setView(view === 'login' ? 'signup' : 'login');
    setError(null);
    setFullName('');
    setEmail('');
    setPassword('');
  };

  if (success) {
    return (
      <div className="bg-gradient-dark flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="card relative text-center">
            <Link
              href="/"
              aria-label="Close"
              className="text-foreground-muted hover:text-foreground absolute right-4 top-4 transition-colors"
            >
              <X className="h-5 w-5" />
            </Link>
            <div className="bg-success/20 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
              <Check className="text-success h-8 w-8" />
            </div>
            <h1 className="text-foreground mb-2 text-2xl font-bold">Check your email</h1>
            <p className="text-foreground-muted mb-6">
              We&apos;ve sent a confirmation link to <strong>{email}</strong>. Click the link to
              verify your account.
            </p>
            <button onClick={() => { setSuccess(false); setView('login'); }} className="btn-primary">
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-dark flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="card relative">
          <Link
            href="/"
            aria-label="Close"
            className="text-foreground-muted hover:text-foreground absolute right-4 top-4 transition-colors"
          >
            <X className="h-5 w-5" />
          </Link>
          {/* Logo */}
          <div className="mb-8 flex items-center justify-center gap-2">
            <div className="bg-gradient-primary flex h-10 w-10 items-center justify-center rounded-xl">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-foreground text-2xl font-bold">Postry AI</span>
          </div>

          <h1 className="text-foreground mb-2 text-center text-2xl font-bold">
            {view === 'login' ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-foreground-muted mb-8 text-center">
            {view === 'login' 
              ? 'Sign in to your account to continue'
              : 'Start creating amazing content with AI'}
          </p>

          {/* Error Message */}
          {error && (
            <div className="bg-error/10 border-error/20 text-error mb-6 rounded-lg border p-3 text-sm">
              {error}
            </div>
          )}

          {/* Google Auth */}
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="btn-secondary mb-6 w-full"
          >
            <Chrome className="mr-2 h-5 w-5" />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="border-border w-full border-t" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card text-foreground-muted px-2">Or continue with email</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {view === 'signup' && (
              <div>
                <label htmlFor="fullName" className="label">
                  Full Name
                </label>
                <div className="relative">
                  <User className="text-foreground-muted absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="input pl-10"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <div className="relative">
                <Mail className="text-foreground-muted absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <div className="relative">
                <Lock className="text-foreground-muted absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-10"
                  minLength={6}
                  required
                />
              </div>
              {view === 'signup' && (
                <p className="text-foreground-muted mt-1 text-xs">
                  Must be at least 6 characters long
                </p>
              )}
            </div>

            {view === 'login' && (
              <div className="flex items-center justify-end">
                <Link
                  href="/forgot-password"
                  className="text-primary hover:text-primary-hover text-sm"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {view === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                view === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Terms (signup only) */}
          {view === 'signup' && (
            <p className="text-foreground-muted mt-6 text-center text-xs">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-primary hover:text-primary-hover">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary hover:text-primary-hover">
                Privacy Policy
              </Link>
            </p>
          )}

          {/* Toggle view */}
          <p className="text-foreground-muted mt-6 text-center">
            {view === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={toggleView}
              className="text-primary hover:text-primary-hover font-medium"
            >
              {view === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
