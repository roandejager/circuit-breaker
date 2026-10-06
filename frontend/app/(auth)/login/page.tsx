'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      router.replace('/dashboard');
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#08090c] px-4 py-10 text-zinc-100">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(16,185,129,0.08),transparent_70%)]" />
      <section className="w-full max-w-[360px] rounded-lg border border-zinc-800/80 bg-[#0e1016] p-6 shadow-2xl transition duration-300 hover:border-white/[0.16]">
        <Link href="/" className="mb-6 inline-flex items-center gap-2.5 text-zinc-100">
          <ShieldAlert aria-hidden="true" className="h-6 w-6 text-zinc-400" />
          <span className="font-mono text-xs font-semibold tracking-tight">AI Circuit Breaker</span>
        </Link>
        <h1 className="text-lg font-semibold tracking-tight text-white">Sign in to Gateway</h1>
        <p className="mt-1.5 text-xs text-zinc-500">Authenticate to manage protected API keys.</p>

        {error && (
          <div role="alert" className="mt-5 flex gap-2 rounded border border-rose-900/70 bg-rose-950/30 p-3 text-xs text-rose-300">
            <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block font-mono text-[10px] text-zinc-500">EMAIL</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-zinc-800 bg-[#08090d] px-3 py-2 font-mono text-xs text-zinc-200 outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block font-mono text-[10px] text-zinc-500">PASSWORD</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-zinc-800 bg-[#08090d] px-3 py-2 font-mono text-xs text-zinc-200 outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-zinc-100 py-2 text-xs font-medium text-zinc-950 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-5 border-t border-zinc-800/80 pt-4 font-sans text-xs text-zinc-500">
          Need an account?{' '}
          <Link href="/signup" className="hover:text-zinc-300">Sign up</Link>
        </p>
      </section>
    </main>
  );
}
