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
    <section aria-labelledby="trust-heading" className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6">
      <header className="mb-6 max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">Trust model // implementation details</p>
        <h2 id="trust-heading" className="mt-2 text-[28px] font-semibold leading-[1.4] tracking-[-0.01em] text-zinc-50">
          Shunt — The In-Memory LLM Firewall
        </h2>
        <p className="mt-2 text-sm leading-[1.5] text-zinc-300">
          Security claims should match the code. Inspect the header flight and verify the public sandbox directly from your terminal.
        </p>
      </header>

      <div className="space-y-6">
        <article className="min-w-0 rounded-[10px] border border-white/[0.08] bg-[#0e1016] p-6 transition-colors duration-150 ease-out hover:border-sky-500/40">
          <div className="grid min-w-0 gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <ShieldCheck aria-hidden="true" className="h-4 w-4 text-zinc-300" />
                <p className="font-mono text-xs text-zinc-400">01 / ZERO-TRUST HEADER FLIGHT</p>
              </div>
              <h3 className="mt-2 text-base font-semibold text-zinc-50">Zero-Trust Header Mode</h3>
              <p className="mt-1 text-sm leading-[1.5] text-zinc-300">
                Your provider credential travels in <code className="font-mono text-zinc-200">x-upstream-key</code> and is held in RAM while this request is forwarded.
              </p>
            </div>

            <div className="min-w-0 overflow-x-auto rounded border border-zinc-800 bg-[#0a0a0a] p-3">
              <svg viewBox="0 0 960 148" role="img" aria-labelledby="credential-flow-title credential-flow-desc" className="h-auto min-w-[960px] w-full">
                <title id="credential-flow-title">Zero-trust credential flow through Shunt</title>
                <desc id="credential-flow-desc">An agent sends a request containing an x-upstream-key header through the Shunt proxy, where the key exists in RAM only, then to OpenAI.</desc>
                <defs>
                  <marker id="trust-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8" fill="none" stroke="#a1a1aa" strokeWidth="1.5" />
                  </marker>
                </defs>
                <rect x="8" y="32" width="188" height="78" rx="6" fill="#0a0a0a" stroke="#a1a1aa" />
                <text x="102" y="62" textAnchor="middle" fill="#f4f4f5" fontSize="12" fontFamily="monospace">Agent Client</text>
                <text x="102" y="86" textAnchor="middle" fill="#a1a1aa" fontSize="12" fontFamily="monospace">OpenAI-compatible SDK</text>
                <path d="M200 71 H322" stroke="#a1a1aa" strokeWidth="1.5" markerEnd="url(#trust-arrow)" />
                <text x="261" y="55" textAnchor="middle" fill="#a1a1aa" fontSize="12" fontFamily="monospace">x-upstream-key</text>
                <rect x="328" y="22" width="304" height="98" rx="6" fill="#0e1016" stroke="#a1a1aa" />
                <text x="480" y="54" textAnchor="middle" fill="#f4f4f5" fontSize="12" fontFamily="monospace">Shunt Proxy</text>
                <text x="480" y="78" textAnchor="middle" fill="#a1a1aa" fontSize="12" fontFamily="monospace">RAM only · 0-byte disk write</text>
                <text x="480" y="100" textAnchor="middle" fill="#a1a1aa" fontSize="12" fontFamily="monospace">key cleared after request flight</text>
                <path d="M636 71 H758" stroke="#a1a1aa" strokeWidth="1.5" markerEnd="url(#trust-arrow)" />
                <text x="697" y="55" textAnchor="middle" fill="#a1a1aa" fontSize="12" fontFamily="monospace">upstream request</text>
                <rect x="764" y="32" width="188" height="78" rx="6" fill="#0a0a0a" stroke="#a1a1aa" />
                <text x="858" y="62" textAnchor="middle" fill="#f4f4f5" fontSize="12" fontFamily="monospace">OpenAI</text>
                <text x="858" y="86" textAnchor="middle" fill="#a1a1aa" fontSize="12" fontFamily="monospace">Upstream provider</text>
              </svg>
            </div>
          </div>

          <div className="mt-4 rounded border border-white/[0.08] bg-[#0a0a0a] p-3 font-mono text-xs leading-[1.5] text-zinc-300">
            Zero-Trust Mode: Keys live strictly in volatile memory for the sub-35ms flight of the request. Never written to PostgreSQL. Never written to logs.
          </div>
        </article>

        <article className="min-w-0 rounded-[10px] border border-white/[0.08] bg-[#0e1016] p-6 transition-colors duration-150 ease-out hover:border-sky-500/40">
          <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-xs text-zinc-400">02 / ZERO-AUTH TERMINAL SANDBOX</p>
              <h3 className="mt-1 text-base font-semibold leading-[1.5] text-zinc-50">Test the 35ms proxy latency live right now in your terminal.</h3>
              <p className="mt-1 max-w-3xl text-sm leading-[1.5] text-zinc-300">
                We don&apos;t store your key—it exists only in RAM for this single request. Sandbox calls are capped at $5/hour and $20/day per server process; requests are forwarded to OpenAI using your credential.
              </p>
            </div>
            <button type="button" onClick={() => void copyCommand()} className="inline-flex shrink-0 items-center gap-2 rounded-md border border-zinc-700 px-3 py-2 font-mono text-xs text-zinc-300 transition-colors duration-150 ease-out hover:border-sky-500/40 hover:text-sky-300">
              {copied ? <Check aria-hidden="true" className="h-4 w-4 text-sky-400" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy command'}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-1 border-b border-zinc-800" role="tablist" aria-label="Sandbox tests">
            <button type="button" role="tab" aria-selected={tab === 'request'} onClick={() => { setTab('request'); setCopied(false); }} className={`border-b px-3 py-2 font-mono text-xs ${tab === 'request' ? 'border-sky-400 text-sky-300' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}>
              Sandbox request
            </button>
            <button type="button" role="tab" aria-selected={tab === 'loop'} onClick={() => { setTab('loop'); setCopied(false); }} className={`border-b px-3 py-2 font-mono text-xs ${tab === 'loop' ? 'border-sky-400 text-sky-300' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}>
              Test Shunt loop stop
            </button>
          </div>

          <pre role="tabpanel" className="mt-3 max-h-64 min-w-0 overflow-auto rounded border border-zinc-800 bg-[#0a0a0a] p-3 font-mono text-xs leading-[1.5] text-zinc-300"><code>{command}</code></pre>
          {copyError && <p role="alert" className="mt-2 text-xs text-[#f87171]">{copyError}</p>}

          {tab === 'loop' && (
            <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-[0.7fr_1.3fr]">
              <div className="rounded border border-zinc-800 bg-[#0a0a0a] p-3">
                <p className="font-mono text-xs uppercase tracking-wider text-zinc-400">Third request · graceful stop response</p>
                <p className="mt-2 font-mono text-xs font-medium text-zinc-100">HTTP 200 · finish_reason: stop</p>
                <p className="mt-1 text-xs leading-[1.5] text-zinc-400">The first two calls reach OpenAI and may incur provider charges. The third repeated request is answered by Shunt.</p>
              </div>
              <pre className="max-h-56 min-w-0 overflow-auto rounded border border-zinc-800 bg-[#0a0a0a] p-3 font-mono text-xs leading-[1.5] text-zinc-300"><code>{gracefulStopPreview}</code></pre>
            </div>
          )}
        </article>

        <aside className="flex min-w-0 flex-col gap-4 rounded-[10px] border border-white/[0.08] bg-[#0e1016] p-6 transition-colors duration-150 ease-out hover:border-sky-500/40 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Code2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-zinc-300" />
            <div>
              <p className="font-mono text-xs text-zinc-400">03 / OPEN-SOURCE AUDIT</p>
              <h3 className="mt-1 text-base font-semibold text-zinc-50">Don&apos;t trust our marketing. Verify the proxy source code directly.</h3>
              <p className="mt-1 text-sm leading-[1.5] text-zinc-300">
                The FastAPI request path, upstream forwarding, streaming, loop handling, and budget responses are open source.
              </p>
            </div>
          </div>
          <a href="https://github.com/roandejager/circuit-breaker/blob/main/backend/app/api/proxy.py" target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-zinc-700 bg-[#0a0a0a] px-3 py-2 font-mono text-xs text-zinc-200 transition-colors duration-150 ease-out hover:border-sky-400 hover:text-sky-300">
            <span className="rounded border border-zinc-700 px-1 py-1 text-xs">GitHub</span>
            Inspect Proxy Source (Open Source)
            <ExternalLink aria-hidden="true" className="h-4 w-4 text-zinc-300" />
          </a>
        </aside>
      </div>
    </section>
  );
}
