'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Mail, Lock, User, Chrome, ArrowLeft, Loader2, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
  };

  const handleGoogleSignup = async () => {
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

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="card text-center">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Check your email</h1>
            <p className="text-foreground-muted mb-6">
              We&apos;ve sent a confirmation link to <strong>{email}</strong>. Click the link to
              verify your account.
            </p>
            <Link href="/login" className="btn-primary">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

          <h1 className="text-2xl font-bold text-foreground text-center mb-2">Create an account</h1>
          <p className="text-foreground-muted text-center mb-8">
            Start creating amazing content with AI
          </p>

          {/* Error Message */}
          {error && (
            <div className="bg-error/10 border border-error/20 text-error rounded-lg p-3 mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Google Signup */}
          <button
            onClick={handleGoogleSignup}
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
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="label">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
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
                  minLength={6}
                  required
                />
              </div>
              <p className="text-xs text-foreground-muted mt-1">
                Must be at least 6 characters long
              </p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Terms */}
          <p className="text-xs text-foreground-muted text-center mt-6">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:text-primary-hover">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary hover:text-primary-hover">
              Privacy Policy
            </Link>
          </p>

          {/* Login Link */}
          <p className="text-center text-foreground-muted mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:text-primary-hover font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
