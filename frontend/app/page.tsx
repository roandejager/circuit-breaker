import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, LockKeyhole, Network, Timer } from 'lucide-react';
import { CodeTabs } from '@/components/CodeTabs';
import { Footer, Navbar } from '@/components/Navigation';
import { TerminalSimulator } from '@/components/TerminalSimulator';

export const metadata: Metadata = {
  title: 'AI Circuit Breaker | LLM Cost Firewall',
  description: 'A drop-in reverse proxy that catches infinite tool loops and enforces hard spend caps in volatile RAM.',
};

const architecture = [
  {
    index: '01',
    title: 'Deterministic deque',
    icon: Network,
    body: 'Three repeated prompts and A→B→A→B oscillations are stopped by a sliding-window detector.',
    metric: '3× repeats · A→B→A→B · <15ms target',
  },
  {
    index: '02',
    title: 'Micro-dollar accounting',
    icon: Timer,
    body: 'Rolling hourly and 24-hour spend checks enforce account ceilings with HTTP 429 backpressure.',
    metric: '1h / 24h rolling caps',
  },
  {
    index: '03',
    title: 'Cryptographic hygiene',
    icon: LockKeyhole,
    body: 'Upstream keys are encrypted at rest with AES-256 Fernet. Prompt text is not written to logs or disk.',
    metric: 'Encrypted keys · no prompt logs',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#090a0f]/90 text-zinc-100">
      <Navbar />

      <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-8 pt-12 sm:px-8 sm:pt-16 lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <div>
          <p className="font-mono text-xs text-zinc-500">[ GATEWAY SPECIFICATION // REV-2026 ]</p>
          <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Stop runaway agents before they drain your API budget.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
            A drop-in reverse proxy that catches infinite tool loops and enforces hard spend caps in volatile RAM. Sub-35ms overhead. Zero payload retention.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-md bg-zinc-100 px-4 py-2 text-xs font-medium text-zinc-950 shadow-sm transition hover:bg-white">
              Get Free Proxy Key <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
            <Link href="/docs" className="rounded-md border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-xs text-zinc-300 transition hover:border-zinc-700">
              Read API Docs
            </Link>
          </div>
          <div className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] text-zinc-400">
            <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Frankfurt (eu-central-1) — 32ms proxy latency — HTTP/2 SSE active
          </div>
        </div>

        <div className="rounded-md border border-zinc-800 bg-[#0b0d13] p-4 font-mono text-xs shadow-sm">
          <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-3 text-zinc-500">
            <span>gateway // request trace</span>
            <span>eu-central-1</span>
          </div>
          <div className="space-y-2">
            <p><span className="text-zinc-600">12:08:41.018</span> <span className="text-zinc-300">POST /v1/chat/completions</span></p>
            <p><span className="text-zinc-600">12:08:41.021</span> <span className="text-zinc-400">window scan: prompt hash match 1/3</span></p>
            <p><span className="text-zinc-600">12:08:41.024</span> <span className="text-zinc-400">spend check: $0.00481 / $2.00 hourly</span></p>
            <p className="border-t border-zinc-800 pt-2 text-zinc-200">HTTP/2 200 · upstream response passed</p>
          </div>
          <p className="mt-3 border-t border-zinc-800 pt-3 text-[10px] text-zinc-600">Illustrative request trace · timings shown for layout only</p>
        </div>
      </section>

      <section aria-labelledby="simulator-title" className="mx-auto max-w-7xl px-5 py-5 sm:px-8">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] text-zinc-500">INTERACTIVE REQUEST SIMULATION</p>
            <h2 id="simulator-title" className="mt-1 text-sm font-medium text-zinc-200">Loop detection trace</h2>
          </div>
          <Link href="/docs#errors" className="text-xs text-zinc-500 hover:text-zinc-300">Protocol reference →</Link>
        </div>
        <TerminalSimulator />
      </section>

      <section className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
        <div className="mb-3">
          <p className="font-mono text-[11px] text-zinc-500">CLIENT CONFIGURATION</p>
          <h2 className="mt-1 text-sm font-medium text-zinc-200">Change the base URL. Keep the SDK.</h2>
        </div>
        <CodeTabs />
      </section>

      <section className="mx-auto max-w-7xl px-5 py-9 sm:px-8">
        <div className="mb-4 border-b border-zinc-800/80 pb-3">
          <p className="font-mono text-[11px] text-zinc-500">ARCHITECTURAL BLUEPRINT</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">Bounded runtime behavior.</h2>
        </div>
        <div className="grid divide-y divide-zinc-800/80 border-y border-zinc-800/80 md:grid-cols-3 md:divide-x md:divide-y-0">
          {architecture.map(({ index, title, icon: Icon, body, metric }) => (
            <article key={index} className="py-4 md:px-5 md:first:pl-0 md:last:pr-0">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-zinc-600">{index}</span>
                <Icon aria-hidden="true" className="h-4 w-4 text-zinc-500" />
              </div>
              <h3 className="mt-3 text-sm font-medium text-zinc-100">{title}</h3>
              <p className="mt-2 min-h-12 text-xs leading-5 text-zinc-400">{body}</p>
              <p className="mt-3 font-mono text-[10px] text-zinc-500">{metric}</p>
            </article>
          ))}
        </div>
        <p className="mt-3 text-[10px] text-zinc-600">Performance figures are engineering targets and depend on deployment, network conditions, and request profile.</p>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-12 pt-5 sm:px-8">
        <div className="border-y border-zinc-800/80 py-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-zinc-800/80 pb-3">
            <div>
              <p className="font-mono text-[11px] text-zinc-500">FAILURE ANALYSIS // ILLUSTRATIVE SCENARIO</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Autopsy of an Overrun</h2>
            </div>
            <span className="font-mono text-[10px] text-zinc-600">SQL RETRY LOOP</span>
          </div>
          <div className="grid gap-4 py-4 md:grid-cols-[1fr_auto] md:items-center">
            <p className="max-w-3xl text-xs leading-5 text-zinc-400">
              An unhandled SQL error leaves an agent retrying the same tool call at 120 attempts per minute. In this example, the sliding deque recognizes the repeat at attempt three and interrupts the cycle before the remaining requests are sent.
            </p>
            <p className="max-w-xs text-[10px] leading-4 text-zinc-600">The $680+ / 45-minute cost is a modeled scenario, not measured customer spend. Estimated avoided spend assumes $35 per intercepted incident.</p>
          </div>
          <ol className="grid gap-px overflow-hidden border border-zinc-800 bg-zinc-800 sm:grid-cols-4">
            {[
              ['00:00', 'SQL write fails', 'Agent receives retryable error.'],
              ['00:01', 'Retry cadence begins', 'Unchanged tool plan repeats at 120/min.'],
              ['00:02', 'Attempt #3 detected', 'Prompt fingerprint crosses repeat threshold.'],
              ['00:02+', 'Loop halted', '$680+ illustrative exposure avoided.'],
            ].map(([time, title, detail], index) => (
              <li key={time} className="bg-[#090a0f] p-3">
                <p className="font-mono text-[10px] text-zinc-600">{String(index + 1).padStart(2, '0')} · {time}</p>
                <p className="mt-2 text-xs font-medium text-zinc-200">{title}</p>
                <p className="mt-1 text-[10px] leading-4 text-zinc-500">{detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-zinc-800 px-5 py-6 sm:px-8">
        <div>
          <p className="text-sm font-medium text-zinc-100">Put explicit limits in front of autonomous requests.</p>
          <p className="mt-1 text-xs text-zinc-500">Create a key and route your first request through the gateway.</p>
        </div>
        <Link href="/signup" className="inline-flex items-center gap-2 rounded-md bg-zinc-100 px-4 py-2 text-xs font-medium text-zinc-950 shadow-sm transition hover:bg-white">
          Create a proxy key <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
        </Link>
      </section>

      <Footer />
    </main>
  );
}
