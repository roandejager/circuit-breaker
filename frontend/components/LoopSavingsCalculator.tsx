'use client';

import { useState } from 'react';

export function LoopSavingsCalculator() {
  const [sessions, setSessions] = useState(1);
  const monthlySavings = sessions * 35;

  return (
    <section aria-labelledby="savings-heading" className="rounded-md border border-white/[0.08] bg-[#0d0e12] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Loop savings calculator</p>
          <h2 id="savings-heading" className="mt-2 text-lg font-semibold text-white">Estimate exposure from runaway sessions</h2>
        </div>
        <p className="font-mono text-2xl text-zinc-100">${monthlySavings.toLocaleString()}<span className="ml-1 text-xs text-zinc-500">/mo</span></p>
      </div>
      <label htmlFor="agent-sessions" className="mt-6 flex items-center justify-between gap-4 text-sm text-zinc-300">
        Active Agent Sessions per Week
        <span className="font-mono text-white">{sessions}</span>
      </label>
      <input
        id="agent-sessions"
        type="range"
        min={1}
        max={25}
        step={1}
        value={sessions}
        onChange={(event) => setSessions(Number(event.target.value))}
        className="mt-4 h-1.5 w-full cursor-pointer accent-zinc-400"
      />
      <div className="mt-2 flex justify-between font-mono text-[10px] text-zinc-600"><span>1 session</span><span>25 sessions</span></div>
      <p className="mt-4 text-[11px] leading-5 text-zinc-500">
        Estimate uses the supplied $35 per prevented incident assumption multiplied by sessions per week. This is a planning estimate, not a guarantee or measured savings.
      </p>
    </section>
  );
}
