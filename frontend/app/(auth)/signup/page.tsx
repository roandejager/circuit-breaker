'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function SignupPage() {
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
      const { error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) throw authError;
      router.replace('/dashboard');
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Unable to create your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#08090a] px-4 py-12 text-zinc-100">
      <section className="w-full max-w-md rounded-md border border-white/[0.08] bg-[#0d0e12] p-7 sm:p-9">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 font-mono text-sm font-semibold tracking-tight text-white">
          <ShieldAlert aria-hidden="true" className="h-5 w-5 text-emerald-400" />
          AI Circuit Breaker
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Create your account</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Start on the free tier. We monitor up to <span className="font-mono text-zinc-200">$15/mo</span> in LLM spend.
        </p>

        {error && (
          <div role="alert" className="mt-6 flex gap-2 rounded border border-rose-900 bg-rose-950/50 p-3 text-sm text-rose-300">
            <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block font-mono text-xs text-zinc-400">EMAIL</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded border border-zinc-800 bg-[#08090a] px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-600"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block font-mono text-xs text-zinc-400">PASSWORD</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded border border-zinc-800 bg-[#08090a] px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-600"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md border border-emerald-700 bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 border-t border-white/[0.08] pt-5 text-sm text-zinc-400">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-400 hover:text-emerald-300">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
