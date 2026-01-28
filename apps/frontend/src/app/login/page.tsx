'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Mail, Lock, Chrome, Loader2, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
  };

  const handleGoogleLogin = async () => {
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

          <h1 className="text-foreground mb-2 text-center text-2xl font-bold">Welcome back</h1>
          <p className="text-foreground-muted mb-8 text-center">
            Sign in to your account to continue
          </p>

          {/* Error Message */}
          {error && (
            <div className="bg-error/10 border-error/20 text-error mb-6 rounded-lg border p-3 text-sm">
              {error}
            </div>
          )}

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
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
          <form onSubmit={handleEmailLogin} className="space-y-4">
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
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="text-primary hover:text-primary-hover text-sm"
              >
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-foreground-muted mt-6 text-center">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary hover:text-primary-hover font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
