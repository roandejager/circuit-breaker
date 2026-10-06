'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setError('');
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Clipboard unavailable. Select and copy the text manually.');
    }
  };

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button type="button" onClick={() => void copy()} className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 px-2 py-1.5 font-mono text-[10px] text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-100">
        {copied ? <Check aria-hidden="true" className="h-3 w-3" /> : <Copy aria-hidden="true" className="h-3 w-3" />}
        {copied ? 'Copied' : label}
      </button>
      {error && <span role="alert" className="text-[10px] text-rose-300">{error}</span>}
    </span>
  );
}
