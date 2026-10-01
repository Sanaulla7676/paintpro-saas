'use client';

import { useState, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function Spinner() {
  return (
    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPending, startTransition] = useTransition();

  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    startTransition(async () => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push(redirectTo);
        router.refresh();
      }
    });
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    startTransition(async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/settings/password`,
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Password reset link sent! Please check your email.');
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(circle at top,#fff 0,#f6f4f1 48%,#edeae6 100%)' }}>

      {/* Card */}
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl"
              style={{ background: 'linear-gradient(145deg,#2b3236,#1f2528)' }}>
              PP
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-ink">
            Paint<span style={{ color: '#d2ad76' }}>Pro</span>
          </h1>
          <p className="text-xs uppercase tracking-widest text-muted mt-1">Premium Painter Workspace</p>
        </div>

        <div className="bg-white border rounded-3xl shadow-premium p-8"
          style={{ borderColor: '#e5e1da' }}>

          {mode === 'login' ? (
            <>
              <h2 className="text-xl font-bold mb-1 text-ink">Welcome back</h2>
              <p className="text-sm text-muted mb-6">Sign in to your workspace</p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="field">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-12 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-opacity"
                  style={{ background: isPending ? '#999' : 'linear-gradient(135deg,#2b3236,#1f2528)' }}
                >
                  {isPending ? <><Spinner /> Signing in…</> : 'Sign In'}
                </button>
              </form>

              <button
                onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
                className="mt-4 text-sm text-center w-full"
                style={{ color: '#8b652e' }}
              >
                Forgot password?
              </button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-1 text-ink">Reset Password</h2>
              <p className="text-sm text-muted mb-6">We&apos;ll send you a reset link</p>

              <form onSubmit={handleForgot} className="space-y-4">
                <div className="field">
                  <label htmlFor="reset-email">Email Address</label>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-12 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                  style={{ background: isPending ? '#999' : '#d2ad76' }}
                >
                  {isPending ? <><Spinner /> Sending…</> : 'Send Reset Link'}
                </button>
              </form>

              <button
                onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                className="mt-4 text-sm text-center w-full text-muted"
              >
                ← Back to sign in
              </button>
            </>
          )}
        </div>

        <p className="text-center text-xs text-muted mt-6">
          Professional painter quotation platform
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'radial-gradient(circle at top,#fff 0,#f6f4f1 48%,#edeae6 100%)' }}>
        <div className="w-full max-w-md bg-white border border-[#e5e1da] rounded-3xl p-8 text-center text-muted">
          Loading…
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

