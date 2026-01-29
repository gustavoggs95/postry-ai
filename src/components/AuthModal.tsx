'use client';

import { useState } from 'react';
import Modal from 'react-modal';
import { createClient } from '@/lib/supabase/client';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'signup';
}

// Set app element for accessibility
if (typeof window !== 'undefined') {
  Modal.setAppElement('body');
}

export default function AuthModal({ isOpen, onClose, initialView = 'login' }: AuthModalProps) {
  const [view, setView] = useState<'login' | 'signup'>(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (view === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.href = '/dashboard';
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setError('Check your email to confirm your account!');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
      className={{
        base: 'outline-none',
        afterOpen: 'ReactModal__Content--after-open',
        beforeClose: 'ReactModal__Content--before-close',
      }}
      overlayClassName={{
        base: 'ReactModal__Overlay fixed inset-0 z-50 flex items-center justify-center',
        afterOpen: 'ReactModal__Overlay--after-open',
        beforeClose: 'ReactModal__Overlay--before-close',
      }}
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
        },
        content: {
          position: 'relative',
          inset: 'auto',
          margin: '1rem',
          width: '100%',
          maxWidth: '448px',
        },
      }}
      closeTimeoutMS={200}
    >
      {/* Modal */}
      <div className="relative rounded-2xl border border-gray-800 bg-[#18181b] shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 text-gray-400 transition-colors hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex items-center justify-center gap-3">
              <img src="/images/postry-icon.png" alt="Postry AI" className="h-12 w-auto" />
              <span className="text-2xl font-bold text-foreground">Postry AI</span>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-white">
              {view === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-gray-400">
              {view === 'login' ? 'Sign in to continue to Postry AI' : 'Get started with Postry AI'}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div
              className={`mb-4 rounded-lg p-3 text-sm ${
                error.includes('Check your email')
                  ? 'border border-green-500/20 bg-green-500/10 text-green-400'
                  : 'border border-red-500/20 bg-red-500/10 text-red-400'
              }`}
            >
              {error}
            </div>
          )}

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="mb-6 flex w-full items-center justify-center gap-3 rounded-lg bg-white px-4 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-surface bg-[#18181b] px-4 text-gray-500">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-primary to-accent px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Loading...' : view === 'login' ? 'Sign in' : 'Create Account'}
            </button>
          </form>

          {/* Toggle view */}
          <p className="mt-6 text-center text-sm text-gray-400">
            {view === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => {
                setView(view === 'login' ? 'signup' : 'login');
                setError('');
                setEmail('');
                setPassword('');
              }}
              className="font-medium text-primary hover:text-primary/80"
            >
              {view === 'login' ? 'Create Account' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </Modal>
  );
}
