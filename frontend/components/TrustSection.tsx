'use client';

import { useState } from 'react';
import { Check, Code2, Copy, ExternalLink, ShieldCheck } from 'lucide-react';

type SandboxTab = 'request' | 'loop';

const requestCommand = `curl -X POST https://circuit-breaker-api.onrender.com/v1/chat/completions \\
  -H "Authorization: Bearer cb_sandbox_test" \\
  -H "x-upstream-key: sk-proj-YOUR_OPENAI_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Verify Shunt proxy"}]}'`;

const loopCommand = `UPSTREAM_KEY="sk-proj-YOUR_OPENAI_KEY"
SESSION_ID="shunt-loop-test-$(date +%s)-$$"
for attempt in 1 2 3; do
  curl -X POST https://circuit-breaker-api.onrender.com/v1/chat/completions \\
    -H "Authorization: Bearer cb_sandbox_test" \\
    -H "x-upstream-key: $UPSTREAM_KEY" \\
    -H "x-session-id: $SESSION_ID" \\
    -H "Content-Type: application/json" \\
    -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Verify Shunt proxy"}]}'
  printf '\\n--- request %s complete ---\\n' "$attempt"
done`;

const gracefulStopPreview = JSON.stringify({
  id: 'chatcmpl-shunt-1791402483',
  object: 'chat.completion',
  created: 1791402483,
  model: 'gpt-4o-mini',
  choices: [{
    index: 0,
    message: {
      role: 'assistant',
      content: '[SHUNT ALERT]: Autonomous agent execution halted. Identical prompt repeated in window. Stream terminated to prevent runaway API spend.',
    },
    finish_reason: 'stop',
  }],
  usage: { prompt_tokens: 14, completion_tokens: 0, total_tokens: 14 },
  circuit_breaker: { triggered: true, reason: 'Identical prompt repeated in window.' },
}, null, 2);

export function TrustSection() {
  const [tab, setTab] = useState<SandboxTab>('request');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');
  const command = tab === 'request' ? requestCommand : loopCommand;

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setCopyError('');
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopyError('Clipboard unavailable. Select and copy the command manually.');
    }
  };

  return (
    <section aria-labelledby="trust-heading" className="mx-auto max-w-6xl px-4 py-9">
      <header className="mb-5 max-w-3xl">
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Trust model // implementation details</p>
        <h2 id="trust-heading" className="mt-2 text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
          Shunt — The In-Memory LLM Firewall
        </h2>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Security claims should match the code. Inspect the header flight and verify the public sandbox directly from your terminal.
        </p>
      </header>

      <div className="space-y-4">
        <article className="rounded-md border border-white/10 bg-[#0e1016] p-5 transition-colors hover:border-sky-500/40">
          <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck aria-hidden="true" className="h-4 w-4 text-sky-400" />
                <p className="font-mono text-[10px] text-zinc-500">01 / ZERO-TRUST HEADER FLIGHT</p>
              </div>
              <h3 className="mt-2 text-base font-semibold text-zinc-100">Zero-Trust Header Mode</h3>
              <p className="mt-1 text-xs text-zinc-400">
                Your provider credential travels in <code className="font-mono text-sky-400">x-upstream-key</code> and is held in RAM while this request is forwarded.
              </p>
            </div>

            <div className="overflow-x-auto rounded border border-zinc-800 bg-[#0a0a0a] p-3">
              <svg viewBox="0 0 840 132" role="img" aria-labelledby="credential-flow-title credential-flow-desc" className="h-auto min-w-[680px] w-full">
                <title id="credential-flow-title">Zero-trust credential flow through Shunt</title>
                <desc id="credential-flow-desc">An agent sends a request containing an x-upstream-key header through the Shunt proxy, where the key exists in RAM only, then to OpenAI.</desc>
                <defs>
                  <marker id="trust-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8" fill="none" stroke="#38BDF8" strokeWidth="1.2" />
                  </marker>
                </defs>
                <rect x="8" y="30" width="168" height="66" rx="5" fill="#0e1016" stroke="#3f3f46" />
                <text x="92" y="54" textAnchor="middle" fill="#e4e4e7" fontSize="12" fontFamily="monospace">Agent Client</text>
                <text x="92" y="76" textAnchor="middle" fill="#a1a1aa" fontSize="9" fontFamily="monospace">OpenAI-compatible SDK</text>
                <path d="M180 63 H258" stroke="#38BDF8" strokeWidth="1.2" markerEnd="url(#trust-arrow)" />
                <text x="218" y="51" textAnchor="middle" fill="#38BDF8" fontSize="8" fontFamily="monospace">x-upstream-key</text>
                <rect x="264" y="20" width="310" height="86" rx="5" fill="#11141b" stroke="#52525b" />
                <text x="419" y="44" textAnchor="middle" fill="#f4f4f5" fontSize="12" fontFamily="monospace">Shunt Proxy</text>
                <text x="419" y="64" textAnchor="middle" fill="#38BDF8" fontSize="9" fontFamily="monospace">RAM only · 0-byte disk write</text>
                <text x="419" y="82" textAnchor="middle" fill="#a1a1aa" fontSize="9" fontFamily="monospace">key cleared after request flight</text>
                <path d="M578 63 H656" stroke="#38BDF8" strokeWidth="1.2" markerEnd="url(#trust-arrow)" />
                <text x="617" y="51" textAnchor="middle" fill="#71717a" fontSize="8" fontFamily="monospace">upstream request</text>
                <rect x="662" y="30" width="168" height="66" rx="5" fill="#0e1016" stroke="#3f3f46" />
                <text x="746" y="54" textAnchor="middle" fill="#e4e4e7" fontSize="12" fontFamily="monospace">OpenAI</text>
                <text x="746" y="76" textAnchor="middle" fill="#a1a1aa" fontSize="9" fontFamily="monospace">Upstream provider</text>
              </svg>
            </div>
          </div>

          <div className="mt-4 rounded border border-sky-500/20 bg-sky-500/5 p-3 font-mono text-[10px] leading-5 text-sky-200">
            Zero-Trust Mode: Keys live strictly in volatile memory for the sub-35ms flight of the request. Never written to PostgreSQL. Never written to logs.
          </div>
        </article>

        <article className="rounded-md border border-white/10 bg-[#0e1016] p-5 transition-colors hover:border-sky-500/40">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] text-zinc-500">02 / ZERO-AUTH TERMINAL SANDBOX</p>
              <h3 className="mt-1 text-base font-semibold text-zinc-100">Test the 35ms proxy latency live right now in your terminal.</h3>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-400">
                We don&apos;t store your key—it exists only in RAM for this single request. Sandbox calls are capped at $5/hour and $20/day per server process; requests are forwarded to OpenAI using your credential.
              </p>
            </div>
            <button type="button" onClick={() => void copyCommand()} className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-zinc-700 px-2.5 py-1.5 font-mono text-[10px] text-zinc-400 transition hover:border-sky-500/40 hover:text-sky-300">
              {copied ? <Check aria-hidden="true" className="h-3 w-3 text-sky-400" /> : <Copy aria-hidden="true" className="h-3 w-3" />}
              {copied ? 'Copied' : 'Copy command'}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-1 border-b border-zinc-800" role="tablist" aria-label="Sandbox tests">
            <button type="button" role="tab" aria-selected={tab === 'request'} onClick={() => { setTab('request'); setCopied(false); }} className={`border-b px-3 py-2 font-mono text-[10px] ${tab === 'request' ? 'border-sky-400 text-sky-300' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
              Sandbox request
            </button>
            <button type="button" role="tab" aria-selected={tab === 'loop'} onClick={() => { setTab('loop'); setCopied(false); }} className={`border-b px-3 py-2 font-mono text-[10px] ${tab === 'loop' ? 'border-sky-400 text-sky-300' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
              Test Shunt loop stop
            </button>
          </div>

          <pre role="tabpanel" className="mt-3 max-h-64 overflow-auto rounded border border-zinc-800 bg-[#0a0a0a] p-3 font-mono text-[10px] leading-5 text-sky-200 sm:text-[11px]"><code>{command}</code></pre>
          {copyError && <p role="alert" className="mt-2 text-[10px] text-rose-300">{copyError}</p>}

          {tab === 'loop' && (
            <div className="mt-4 grid gap-3 lg:grid-cols-[0.7fr_1.3fr]">
              <div className="rounded border border-zinc-800 bg-[#0a0a0a] p-3">
                <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Third request · graceful stop response</p>
                <p className="mt-2 font-mono text-xs font-medium text-sky-400">HTTP 200 · finish_reason: stop</p>
                <p className="mt-1 text-[10px] leading-4 text-zinc-500">The first two calls reach OpenAI and may incur provider charges. The third repeated request is answered by Shunt.</p>
              </div>
              <pre className="max-h-56 overflow-auto rounded border border-zinc-800 bg-[#0a0a0a] p-3 font-mono text-[9px] leading-4 text-zinc-300 sm:text-[10px]"><code>{gracefulStopPreview}</code></pre>
            </div>
          )}
        </article>

        <aside className="flex flex-col gap-4 rounded-md border border-white/10 bg-[#0e1016] p-5 transition-colors hover:border-sky-500/40 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Code2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" />
            <div>
              <p className="font-mono text-[10px] text-zinc-500">03 / OPEN-SOURCE AUDIT</p>
              <h3 className="mt-1 text-sm font-semibold text-zinc-100">Don&apos;t trust our marketing. Verify the proxy source code directly.</h3>
              <p className="mt-1 text-xs leading-5 text-zinc-400">
                The FastAPI request path, upstream forwarding, streaming, loop handling, and budget responses are open source.
              </p>
            </div>
          </div>
          <a href="https://github.com/roandejager/shunt/blob/main/app/api/proxy.py" target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-sky-500/30 bg-[#0a0a0a] px-3 py-2 font-mono text-[10px] text-zinc-200 transition hover:border-sky-400 hover:text-sky-300">
            <span className="rounded border border-zinc-700 px-1 py-0.5 text-[9px]">GitHub</span>
            Inspect Proxy Source (Open Source)
            <ExternalLink aria-hidden="true" className="h-3 w-3 text-sky-400" />
          </a>
        </aside>
      </div>
    </section>
  );
}
