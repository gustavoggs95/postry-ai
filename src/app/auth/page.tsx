'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, User, Chrome, Loader2, Check, X } from 'lucide-react';
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-dark p-4">
        <div className="w-full max-w-md">
          <div className="card relative text-center">
            <Link
              href="/"
              aria-label="Close"
              className="absolute right-4 top-4 text-foreground-muted transition-colors hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </Link>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
              <Check className="h-8 w-8 text-success" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-foreground">Check your email</h1>
            <p className="mb-6 text-foreground-muted">
              We&apos;ve sent a confirmation link to <strong>{email}</strong>. Click the link to
              verify your account.
            </p>
            <button
              onClick={() => {
                setSuccess(false);
                setView('login');
              }}
              className="btn-primary"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-dark p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="card relative">
          <Link
            href="/"
            aria-label="Close"
            className="absolute right-4 top-4 text-foreground-muted transition-colors hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Link>
          {/* Logo */}
          <div className="mb-8 flex items-center justify-center gap-3">
            <img src="/images/postry-icon.png" alt="Postry AI" className="h-12 w-auto" />
            <span className="text-2xl font-bold text-foreground">Postry AI</span>
          </div>

          <h1 className="mb-2 text-center text-2xl font-bold text-foreground">
            {view === 'login' ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="mb-8 text-center text-foreground-muted">
            {view === 'login'
              ? 'Sign in to your account to continue'
              : 'Start creating amazing content with AI'}
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg border border-error/20 bg-error/10 p-3 text-sm text-error">
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
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card px-2 text-foreground-muted">Or continue with email</span>
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
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground-muted" />
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
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground-muted" />
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
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground-muted" />
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
                <p className="mt-1 text-xs text-foreground-muted">
                  Must be at least 6 characters long
                </p>
              )}
            </div>

            {view === 'login' && (
              <div className="flex items-center justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:text-primary-hover"
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
              ) : view === 'login' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Terms (signup only) */}
          {view === 'signup' && (
            <p className="mt-6 text-center text-xs text-foreground-muted">
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
          <p className="mt-6 text-center text-foreground-muted">
            {view === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={toggleView}
              className="font-medium text-primary hover:text-primary-hover"
            >
              {view === 'login' ? 'Create Account' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
