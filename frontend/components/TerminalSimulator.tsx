'use client';

import { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';

const stages = [
  { prompt: 'INSERT INTO orders ...', status: 'POST /v1/chat/completions 200 OK', tone: 'text-zinc-300' },
  { prompt: 'INSERT INTO orders ...', status: 'POST /v1/chat/completions 200 OK', tone: 'text-zinc-300' },
  { prompt: 'INSERT INTO orders ...', status: 'POST /v1/chat/completions 200 finish_reason=stop', tone: 'text-zinc-100' },
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
    <div className="h-[260px] overflow-hidden rounded-[10px] border border-white/[0.08] bg-[#0e1016] shadow-2xl shadow-black/80 transition-colors duration-150 ease-out hover:border-sky-500/40">
      <div className="flex h-10 items-center justify-between border-b border-zinc-800 px-4">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
          <span className="ml-2 font-mono text-xs text-zinc-400">gateway-simulation.log</span>
        </div>
        <span className="rounded border border-zinc-800 bg-[#0a0a0a] px-2 py-1 font-mono text-xs uppercase tracking-wide text-zinc-400">SIMULATED SHUNT</span>
      </div>
      <div className="grid h-[calc(100%-64px)] gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div aria-live="polite" className="min-h-0 min-w-0 space-y-1 overflow-auto font-mono text-xs leading-[1.5]">
          <p className="text-zinc-400">$ agent.run --task &quot;insert order&quot;</p>
          {requests.map((requestNumber, index) => {
            const stage = stages[index];
            return (
              <div key={requestNumber} className="grid min-w-[520px] grid-cols-[36px_1fr] gap-2">
                <span className="text-zinc-400">#{requestNumber}</span>
                <span className={stage.tone}>{stage.status} <span className="text-zinc-400">· {stage.prompt}</span></span>
              </div>
            );
          })}
          {requests.length === 0 && <p className="text-zinc-400">The agent repeats the same database write after an unchanged retry.</p>}
          {requests.length > 0 && !complete && (
            <p className="text-zinc-400">Repeated request observed. Run again to simulate the next attempt.</p>
          )}
          {complete && <p className="text-zinc-100">Shunt halted the loop · repeat threshold reached · finish_reason: stop</p>}
        </div>
        <div className="flex gap-2 sm:flex-col">
          <button type="button" onClick={runRequest} disabled={complete} className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-200 transition-colors duration-150 ease-out hover:border-sky-500/40 hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-50">
            <Play aria-hidden="true" className="h-4 w-4" />
            {complete ? 'Loop stopped' : 'Run next request'}
          </button>
          <button type="button" onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-800 px-3 py-2 text-xs text-zinc-300 transition-colors duration-150 ease-out hover:bg-zinc-900 hover:text-zinc-100">
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>
      <div className="flex h-8 items-center border-t border-zinc-800 px-4 font-mono text-xs text-zinc-400">
        {requests.length < 3 ? `WINDOW ${requests.length}/3 · shunt status: ${currentStage.status}` : 'WINDOW 3/3 · SHUNT STOPPED'}
      </div>
    </div>
  );
}
