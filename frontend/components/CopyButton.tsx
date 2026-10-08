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
      <button type="button" onClick={() => void copy()} className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-3 py-2 font-mono text-xs text-zinc-300 transition-colors duration-150 ease-out hover:border-sky-500/40 hover:text-sky-400">
        {copied ? <Check aria-hidden="true" className="h-4 w-4" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
        {copied ? 'Copied' : label}
      </button>
      {error && <span role="alert" className="text-xs text-[#f87171]">{error}</span>}
    </span>
  );
}
