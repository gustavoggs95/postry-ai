'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Mail, Lock, Chrome, ArrowLeft, Loader2 } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Card */}
        <div className="card">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">Postry AI</span>
          </div>

          <h1 className="text-2xl font-bold text-foreground text-center mb-2">Welcome back</h1>
          <p className="text-foreground-muted text-center mb-8">
            Sign in to your account to continue
          </p>

          {/* Error Message */}
          {error && (
            <div className="bg-error/10 border border-error/20 text-error rounded-lg p-3 mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn-secondary w-full mb-6"
          >
            <Chrome className="w-5 h-5 mr-2" />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-foreground-muted">Or continue with email</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
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
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
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
                className="text-sm text-primary hover:text-primary-hover"
              >
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-foreground-muted mt-6">
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
