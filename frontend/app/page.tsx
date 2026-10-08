import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CodeTabs } from '@/components/CodeTabs';
import { CopyButton } from '@/components/CopyButton';
import { Footer, Navbar } from '@/components/Navigation';
import { TerminalSimulator } from '@/components/TerminalSimulator';
import { TrustSection } from '@/components/TrustSection';

export const metadata: Metadata = {
  title: 'Shunt | The In-Memory LLM Firewall',
  description: 'A reverse proxy that detects recursive agent loops and enforces spend caps in volatile memory, without retaining prompt payloads.',
};

const loopStopPayload = JSON.stringify({
  id: 'chatcmpl-shunt-1791402483',
  object: 'chat.completion',
  created: 1791402483,
  model: 'gpt-4o-mini',
  choices: [{
    index: 0,
    message: {
      role: 'assistant',
      content: '[SHUNT ALERT]: Autonomous agent execution halted.',
    },
    finish_reason: 'stop',
  }],
  usage: { prompt_tokens: 14, completion_tokens: 0, total_tokens: 14 },
  circuit_breaker: { triggered: true, reason: 'Prompt repetition threshold exceeded.' },
}, null, 2);

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      <Navbar />

      <section className="mx-auto grid max-w-7xl gap-7 px-5 pb-7 pt-10 sm:px-8 sm:pt-14 lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <div>
          <p className="font-mono text-xs text-zinc-500">[ GATEWAY SPECIFICATION // REV-2026 ]</p>
          <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Stop runaway agents before they drain your API budget.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
            A drop-in reverse proxy that catches infinite tool loops and enforces hard spend caps in volatile RAM. Sub-35ms overhead. Zero payload retention.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-md bg-zinc-100 px-4 py-2 text-xs font-medium text-zinc-950 shadow-sm transition hover:bg-white">
              Get Free Proxy Key <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
            <Link href="/docs" className="rounded-md border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-xs text-zinc-300 transition hover:border-zinc-700">
              Read API Docs
            </Link>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-zinc-800/80 bg-[#0e1016] px-3 py-2">
            <span className="font-mono text-[10px] text-zinc-500">TRY LIVE IN YOUR TERMINAL</span>
            <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-[11px] text-zinc-300">curl -I https://circuit-breaker-api.onrender.com/health</code>
            <CopyButton value="curl -I https://circuit-breaker-api.onrender.com/health" label="Copy" />
          </div>
          <div className="mt-3 inline-flex items-center gap-2 font-mono text-[11px] text-zinc-400">
            <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400 shadow-[0_0_8px_#38BDF8]" />
            Frankfurt (eu-central-1) — 32ms proxy latency — HTTP/2 SSE active
          </div>
        </div>

        <div className="rounded-md border border-zinc-800 bg-[#0e1016] p-4 font-mono text-xs shadow-lg shadow-black/30">
          <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-3 text-zinc-500">
            <span>gateway // request trace</span>
            <span>eu-central-1</span>
          </div>
          <div className="space-y-2">
            <p><span className="text-zinc-600">12:08:41.018</span> <span className="text-zinc-300">POST /v1/chat/completions</span></p>
            <p><span className="text-zinc-600">12:08:41.021</span> <span className="text-zinc-400">window scan: prompt hash match 1/3</span></p>
            <p><span className="text-zinc-600">12:08:41.024</span> <span className="text-zinc-400">spend check: within configured cap</span></p>
            <p className="border-t border-zinc-800 pt-2 text-zinc-200">HTTP/2 200 · upstream response passed</p>
          </div>
          <p className="mt-3 border-t border-zinc-800 pt-3 text-[10px] text-zinc-600">Simulated trace · example values</p>
        </div>
      </section>

      <TrustSection />

      <section className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
        <div className="mb-4 border-b border-zinc-800/80 pb-3">
          <p className="font-mono text-[11px] text-zinc-500">ARCHITECTURE // REQUEST PATH</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">Data path and enforcement points</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <article className="group rounded-md border border-white/[0.08] bg-[#0e1016] p-5 transition-colors hover:border-sky-500/40 md:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] text-zinc-600">01 / REQUEST FLOW</p>
                <h3 className="mt-1 text-sm font-medium text-zinc-100">Volatile-memory request inspection</h3>
              </div>
              <span className="font-mono text-[10px] text-zinc-500">HTTP/2 · SSE</span>
            </div>
            <div className="mt-5 overflow-x-auto">
              <svg viewBox="0 0 780 170" role="img" aria-labelledby="architecture-flow-title architecture-flow-desc" className="h-auto min-w-[640px] w-full">
                <title id="architecture-flow-title">Shunt request architecture</title>
                <desc id="architecture-flow-desc">An agent sends a request through the Shunt RAM hash and spend-cap engine, then to the OpenAI API.</desc>
                <defs>
                  <marker id="flow-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8" fill="none" stroke="#71717a" strokeWidth="1.2" />
                  </marker>
                </defs>
                <path d="M180 78 H292" stroke="#52525b" strokeWidth="1.5" markerEnd="url(#flow-arrow)" />
                <path d="M500 78 H612" stroke="#52525b" strokeWidth="1.5" markerEnd="url(#flow-arrow)" />
                <rect x="12" y="38" width="166" height="78" rx="6" fill="#090a0f" stroke="#3f3f46" />
                <text x="95" y="68" textAnchor="middle" fill="#e4e4e7" fontSize="13" fontFamily="monospace">Your Agent</text>
                <text x="95" y="91" textAnchor="middle" fill="#71717a" fontSize="10" fontFamily="monospace">OpenAI SDK / REST</text>
                <rect x="296" y="24" width="204" height="106" rx="6" fill="#11141b" stroke="#71717a" />
                <text x="398" y="53" textAnchor="middle" fill="#f4f4f5" fontSize="12" fontFamily="monospace">Shunt Proxy</text>
                <text x="398" y="74" textAnchor="middle" fill="#a1a1aa" fontSize="10" fontFamily="monospace">RAM Hash &amp; Cap Engine</text>
                <text x="398" y="101" textAnchor="middle" fill="#71717a" fontSize="9" fontFamily="monospace">No prompt payload persisted</text>
                <rect x="614" y="38" width="154" height="78" rx="6" fill="#090a0f" stroke="#3f3f46" />
                <text x="691" y="68" textAnchor="middle" fill="#e4e4e7" fontSize="13" fontFamily="monospace">api.openai.com</text>
                <text x="691" y="91" textAnchor="middle" fill="#71717a" fontSize="10" fontFamily="monospace">Upstream provider</text>
                <text x="235" y="64" textAnchor="middle" fill="#a1a1aa" fontSize="9" fontFamily="monospace">&lt;15ms target</text>
                <text x="556" y="64" textAnchor="middle" fill="#a1a1aa" fontSize="9" fontFamily="monospace">HTTP/2 SSE</text>
                <text x="398" y="151" textAnchor="middle" fill="#71717a" fontSize="9" fontFamily="monospace">loop detection + hourly / daily spend checks</text>
              </svg>
            </div>
          </article>

          <article className="group rounded-md border border-white/[0.08] bg-[#0e1016] p-5 transition-colors hover:border-sky-500/40">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-mono text-[10px] text-zinc-600">02 / LOOP STOP RESPONSE</p>
                <h3 className="mt-1 text-sm font-medium text-zinc-100">HTTP 200 · finish_reason: stop</h3>
              </div>
              <CopyButton value={loopStopPayload} label="Copy JSON" />
            </div>
            <pre className="mt-4 overflow-x-auto rounded border border-zinc-800 bg-[#0a0a0a] p-3 font-mono text-[10px] leading-5 text-sky-300"><code>{loopStopPayload}</code></pre>
          </article>

          <article className="group rounded-md border border-white/[0.08] bg-[#0e1016] p-5 transition-colors hover:border-sky-500/40">
            <p className="font-mono text-[10px] text-zinc-600">03 / VOLATILE MEMORY</p>
            <h3 className="mt-1 text-sm font-medium text-zinc-100">RAM hash benchmark</h3>
            <p className="mt-4 font-mono text-2xl text-sky-400">&lt;15ms</p>
            <p className="mt-1 text-[10px] text-zinc-500">memory execution target</p>
            <div className="mt-4 space-y-2 border-t border-zinc-800 pt-3 font-mono text-[10px]">
              <div className="flex justify-between gap-3"><span className="text-zinc-500">Fingerprint</span><span className="text-zinc-300">SHA-256</span></div>
              <div className="flex justify-between gap-3"><span className="text-zinc-500">Prompt disk writes</span><span className="text-zinc-300">0</span></div>
              <div className="flex justify-between gap-3"><span className="text-zinc-500">Payload storage</span><span className="text-zinc-300">None</span></div>
            </div>
          </article>

          <article className="group rounded-md border border-white/[0.08] bg-[#0e1016] p-5 transition-colors hover:border-sky-500/40 md:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] text-zinc-600">04 / MICRO-DOLLAR ACCOUNTING</p>
                <h3 className="mt-1 text-sm font-medium text-zinc-100">Rolling spend ceilings and backpressure</h3>
              </div>
              <span className="font-mono text-[10px] text-zinc-500">429 BUDGET_LIMIT_BREACHED</span>
            </div>
            <p className="mt-3 max-w-2xl text-xs leading-5 text-zinc-400">Requests are checked against hourly and daily account caps before they are sent upstream. The bars below illustrate cap windows, not live account utilization.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Hourly ceiling', cap: '$2.00 / hour' },
                { label: 'Daily ceiling', cap: '$10.00 / day' },
              ].map(({ label, cap }) => (
                <div key={label} className="rounded border border-zinc-800 bg-[#0a0a0a] p-3">
                  <div className="flex justify-between gap-3 font-mono text-[10px]">
                    <span className="text-zinc-400">{label}</span>
                    <span className="text-zinc-300">{cap}</span>
                  </div>
                  <div className="relative mt-3 h-1.5 rounded bg-zinc-800">
                    <span className="absolute right-0 top-0 h-1.5 w-px bg-sky-400" />
                  </div>
                  <p className="mt-1.5 text-right font-mono text-[9px] text-zinc-600">CAP THRESHOLD · USAGE NOT SHOWN</p>
                </div>
              ))}
            </div>
          </article>
        </div>
        <p className="mt-3 text-[10px] text-zinc-600">Performance figures are engineering targets and depend on deployment, network conditions, and request profile.</p>
      </section>

      <section aria-labelledby="simulator-title" className="mx-auto max-w-7xl px-5 py-4 sm:px-8">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] text-zinc-500">INTERACTIVE REQUEST SIMULATION</p>
            <h2 id="simulator-title" className="mt-1 text-sm font-medium text-zinc-200">Loop detection trace</h2>
          </div>
          <Link href="/docs#errors" className="text-xs text-zinc-500 hover:text-zinc-300">Protocol reference →</Link>
        </div>
        <TerminalSimulator />
      </section>

      <section className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
        <div className="mb-3">
          <p className="font-mono text-[11px] text-zinc-500">CLIENT CONFIGURATION</p>
          <h2 className="mt-1 text-sm font-medium text-zinc-200">Change the base URL. Keep the SDK.</h2>
        </div>
        <CodeTabs />
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-9 pt-2 sm:px-8">
        <div className="border-y border-zinc-800/80 py-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-zinc-800/80 pb-3">
            <div>
              <p className="font-mono text-[11px] text-zinc-500">FAILURE ANALYSIS // ILLUSTRATIVE SCENARIO</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Autopsy of an Overrun</h2>
            </div>
            <span className="font-mono text-[10px] text-zinc-600">SQL RETRY LOOP</span>
          </div>
          <div className="grid gap-4 py-4 md:grid-cols-[1fr_auto] md:items-center">
            <p className="max-w-3xl text-xs leading-5 text-zinc-400">An unhandled SQL error leaves an agent retrying the same tool call at 120 attempts per minute. In this example, the sliding deque recognizes the repeat at attempt three and interrupts the cycle before the remaining requests are sent.</p>
            <p className="max-w-xs text-[10px] leading-4 text-zinc-600">The $680+ / 45-minute cost is a modeled scenario, not measured customer spend. Estimated avoided spend assumes $35 per intercepted incident.</p>
          </div>
          <ol className="grid gap-px overflow-hidden border border-zinc-800 bg-zinc-800 sm:grid-cols-4">
            {[
              ['00:00', 'SQL write fails', 'Agent receives retryable error.'],
              ['00:01', 'Retry cadence begins', 'Unchanged tool plan repeats at 120/min.'],
              ['00:02', 'Attempt #3 detected', 'Prompt fingerprint crosses repeat threshold.'],
              ['00:02+', 'Loop halted', '$680+ illustrative exposure avoided.'],
            ].map(([time, title, detail], index) => (
              <li key={time} className="bg-[#0a0a0a] p-3">
                <p className="font-mono text-[10px] text-zinc-600">{String(index + 1).padStart(2, '0')} · {time}</p>
                <p className="mt-2 text-xs font-medium text-zinc-200">{title}</p>
                <p className="mt-1 text-[10px] leading-4 text-zinc-500">{detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-8 sm:px-8">
        <div className="flex flex-col gap-4 rounded-md border border-white/[0.08] bg-[#0e1016] p-5 transition-colors hover:border-sky-500/40 sm:flex-row sm:items-center">
          {/* The specified GitHub avatar is a fixed external profile image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://github.com/roandejager.png" alt="Roan de Jager" className="h-12 w-12 rounded-full border border-zinc-700" />
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-medium text-zinc-100">Built by an Engineer</h2>
            <p className="mt-1 text-xs text-zinc-400">Built by Roan de Jager (@roandejager) in Norway.</p>
            <p className="mt-2 max-w-4xl text-[11px] leading-5 text-zinc-500">I built Shunt after an autonomous agent got trapped in a recursive tool retry loop and burned through hundreds of dollars in API credits overnight. It&apos;s built in Python and FastAPI for sub-35ms raw performance with strict zero-payload retention.</p>
            <div className="mt-3 flex gap-4 font-mono text-[10px]">
              <a href="https://github.com/roandejager/shunt" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-zinc-100">GitHub repository ↗</a>
              <a href="mailto:contact.roandejager@gmail.com" className="text-zinc-400 hover:text-zinc-100">Email Roan</a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
