'use client';

import { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';

const stages = [
  { prompt: 'INSERT INTO orders ...', status: 'POST /v1/chat/completions 200 OK', tone: 'text-zinc-300' },
  { prompt: 'INSERT INTO orders ...', status: 'POST /v1/chat/completions 200 OK', tone: 'text-zinc-300' },
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
    <div className="h-[260px] overflow-hidden rounded-md border border-zinc-800 bg-[#0b0d13]">
      <div className="flex h-10 items-center justify-between border-b border-zinc-800 px-4">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
          <span className="ml-2 font-mono text-[11px] text-zinc-500">gateway-simulation.log</span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wide text-zinc-600">Local demonstration</span>
      </div>
      <div className="grid h-[calc(100%-64px)] gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div aria-live="polite" className="min-h-0 space-y-2 overflow-auto font-mono text-xs leading-5">
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
        <div className="flex gap-2 sm:flex-col">
          <button type="button" onClick={runRequest} disabled={complete} className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50">
            <Play aria-hidden="true" className="h-3.5 w-3.5" />
            {complete ? 'Loop stopped' : 'Run next request'}
          </button>
          <button type="button" onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-800 px-3 py-2 text-xs text-zinc-400 hover:bg-zinc-900 hover:text-white">
            <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>
      <div className="flex h-6 items-center border-t border-zinc-800 px-4 font-mono text-[10px] text-zinc-600">
        {requests.length < 3 ? `WINDOW ${requests.length}/3 · gateway status: ${currentStage.status}` : 'WINDOW 3/3 · CIRCUIT OPEN'}
      </div>
    </div>
  );
}
