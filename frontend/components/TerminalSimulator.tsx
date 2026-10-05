'use client';

import { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';

const stages = [
  { prompt: 'INSERT INTO orders ...', status: 'POST /v1/chat/completions 200 OK', tone: 'text-emerald-300' },
  { prompt: 'INSERT INTO orders ...', status: 'POST /v1/chat/completions 200 OK', tone: 'text-emerald-300' },
  { prompt: 'INSERT INTO orders ...', status: 'POST /v1/chat/completions 400 infinite_loop_killed', tone: 'text-rose-300' },
];

export function TerminalSimulator() {
  const [requests, setRequests] = useState<number[]>([]);
  const complete = requests.length >= stages.length;
  const currentStage = stages[Math.min(requests.length, stages.length - 1)];

  const runRequest = () => {
    if (complete) return;
    setRequests((current) => [...current, current.length + 1]);
  };

  const reset = () => setRequests([]);

  return (
    <div className="overflow-hidden rounded-md border border-white/[0.08] bg-[#0d0e12]">
      <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-rose-500/80" />
          <span className="h-2 w-2 rounded-full bg-amber-500/80" />
          <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
          <span className="ml-2 font-mono text-[11px] text-zinc-500">gateway-simulation.log</span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wide text-zinc-600">Local demonstration</span>
      </div>
      <div className="grid gap-6 p-4 sm:p-6 md:grid-cols-[1fr_auto] md:items-end">
        <div aria-live="polite" className="min-h-36 space-y-2 overflow-x-auto font-mono text-xs leading-5">
          <p className="text-zinc-600">$ agent.run --task &quot;insert order&quot;</p>
          {requests.map((requestNumber, index) => {
            const stage = stages[index];
            return (
              <div key={requestNumber} className="grid min-w-[520px] grid-cols-[36px_1fr] gap-2">
                <span className="text-zinc-600">#{requestNumber}</span>
                <span className={stage.tone}>{stage.status} <span className="text-zinc-500">· {stage.prompt}</span></span>
              </div>
            );
          })}
          {requests.length === 0 && <p className="text-zinc-500">The agent repeats the same database write after an unchanged retry.</p>}
          {requests.length > 0 && !complete && (
            <p className="text-zinc-500">Repeated request observed. Run again to simulate the next attempt.</p>
          )}
          {complete && <p className="text-rose-300">Circuit open · repeat threshold reached · further upstream calls stopped</p>}
        </div>
        <div className="flex gap-2 md:flex-col">
          <button type="button" onClick={runRequest} disabled={complete} className="inline-flex items-center justify-center gap-2 rounded-md border border-emerald-800 px-3 py-2 text-xs text-emerald-300 hover:bg-emerald-950/40 disabled:cursor-not-allowed disabled:opacity-50">
            <Play aria-hidden="true" className="h-3.5 w-3.5" />
            {complete ? 'Loop stopped' : 'Run next request'}
          </button>
          <button type="button" onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-800 px-3 py-2 text-xs text-zinc-400 hover:bg-zinc-900 hover:text-white">
            <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>
      <div className="border-t border-white/[0.08] px-4 py-2 font-mono text-[10px] text-zinc-600">
        {requests.length < 3 ? `WINDOW ${requests.length}/3 · gateway status: ${currentStage.status}` : 'WINDOW 3/3 · CIRCUIT OPEN'}
      </div>
    </div>
  );
}
