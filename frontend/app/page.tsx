import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, LockKeyhole, Network, Timer } from 'lucide-react';
import { CodeTabs } from '@/components/CodeTabs';
import { Footer, Navbar } from '@/components/Navigation';
import { TerminalSimulator } from '@/components/TerminalSimulator';

export const metadata: Metadata = {
  title: 'AI Circuit Breaker | LLM Cost Firewall',
  description: 'A lightweight reverse proxy that detects recursive LLM agent loops and enforces spend caps before costs run away.',
};

const specifications = [
  { label: 'Proxy latency', value: '<35ms', icon: Timer, detail: 'Average overhead target' },
  { label: 'Encryption at rest', value: 'AES-256', icon: LockKeyhole, detail: 'Upstream key storage' },
  { label: 'Loop window', value: '3× repeats', icon: Network, detail: 'A→B→A→B oscillations detected' },
  { label: 'Prompt retention', value: 'Zero disk', icon: Check, detail: 'Prompts are not persisted' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#08090a] text-zinc-100">
      <Navbar />

      <section className="mx-auto max-w-7xl px-5 pb-12 pt-20 sm:px-8 sm:pt-28">
        <div className="max-w-4xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-emerald-400">Runtime protection for LLM applications</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-6xl">
            The LLM Cost Firewall for Autonomous AI Agents.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-zinc-400 sm:text-lg">
            A lightweight reverse proxy that intercepts recursive loops and enforces hard dollar caps before OpenAI drains your credit card.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-md border border-emerald-600 bg-emerald-600 px-4 py-3 text-sm font-medium text-zinc-950 hover:bg-emerald-500">
              Get Free Proxy Key ($15/mo spend free)
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link href="/docs" className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-4 py-3 text-sm text-zinc-200 hover:bg-zinc-900">
              Read Documentation
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="terminal-heading" className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <div className="mb-4">
          <h2 id="terminal-heading" className="font-mono text-xs uppercase tracking-widest text-zinc-500">See the circuit breaker in operation</h2>
          <p className="mt-1 text-sm text-zinc-400">A repeat request is stopped before it can fan out into another tool cycle.</p>
        </div>
        <TerminalSimulator />
      </section>

      <section className="border-y border-white/[0.08] bg-[#0a0b0e]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="mb-7 max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">One endpoint change</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Keep your client. Add a guardrail.</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">Point your OpenAI-compatible client at the Circuit Breaker gateway and use a protected key.</p>
          </div>
          <CodeTabs />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="rounded-md border border-amber-900/60 bg-[#0d0e12]">
          <div className="border-b border-white/[0.08] px-5 py-4 sm:px-7">
            <p className="font-mono text-[10px] uppercase tracking-widest text-amber-400">Illustrative failure scenario · not customer telemetry</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">Autopsy of an Agent Recursion Overrun</h2>
          </div>
          <div className="grid gap-8 px-5 py-6 sm:px-7 lg:grid-cols-[1fr_280px]">
            <div>
              <p className="max-w-3xl text-sm leading-6 text-zinc-400">
                An autonomous agent retries a failed database write without changing its plan. If it runs unguarded at 120 calls per minute, a 45-minute loop can exceed $680 in model spend. Circuit Breaker fingerprints recent prompts in a sliding-window deque and can stop a repeating or oscillating sequence at call three, with a target decision time of 12ms.
              </p>
              <p className="mt-3 text-xs leading-5 text-zinc-500">
                The spend estimate is an example, not a measured customer result. Actual cost depends on model, prompt size, and retry behavior.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded border border-white/[0.08] bg-white/[0.08] font-mono">
              <div className="bg-[#08090a] p-3">
                <p className="text-[10px] text-zinc-600">UNGUARDED RATE</p>
                <p className="mt-2 text-sm text-zinc-200">120 calls/min</p>
              </div>
              <div className="bg-[#08090a] p-3">
                <p className="text-[10px] text-zinc-600">POTENTIAL SPEND</p>
                <p className="mt-2 text-sm text-zinc-200">$680+ / 45m</p>
              </div>
              <div className="bg-[#08090a] p-3">
                <p className="text-[10px] text-zinc-600">DETECTION</p>
                <p className="mt-2 text-sm text-emerald-300">Call #3</p>
              </div>
              <div className="bg-[#08090a] p-3">
                <p className="text-[10px] text-zinc-600">DECISION TARGET</p>
                <p className="mt-2 text-sm text-emerald-300">12ms</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/[0.08] bg-[#0a0b0e]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="mb-7">
            <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">System properties</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Deterministic guardrails, clear boundaries.</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {specifications.map(({ label, value, icon: Icon, detail }) => (
              <article key={label} className="rounded-md border border-white/[0.08] bg-[#0d0e12] p-4">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
                  <Icon aria-hidden="true" className="h-4 w-4 text-zinc-600" />
                </div>
                <p className="mt-4 font-mono text-2xl text-white">{value}</p>
                <p className="mt-1 text-xs text-zinc-500">{detail}</p>
              </article>
            ))}
          </div>
          <p className="mt-4 text-[11px] text-zinc-600">Latency and security properties depend on deployment configuration and are targets/specifications, not third-party certifications.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-5 rounded-md border border-emerald-900/70 bg-[#0d0e12] p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-emerald-400">Start with the free tier</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Put a spend ceiling in front of your agents.</h2>
            <p className="mt-2 text-sm text-zinc-400">Create an account and configure a protected key.</p>
          </div>
          <Link href="/signup" className="inline-flex shrink-0 items-center gap-2 rounded-md border border-emerald-600 bg-emerald-600 px-4 py-2.5 text-sm font-medium text-zinc-950 hover:bg-emerald-500">
            Get started <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
