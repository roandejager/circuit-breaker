'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

const code = {
  Python: `from openai import OpenAI\n\nclient = OpenAI(\n    base_url="https://circuit-breaker-api.onrender.com/v1",\n    api_key="cb_live_...",\n)`,
  TypeScript: `import OpenAI from "openai";\n\nconst client = new OpenAI({\n  baseURL: "https://circuit-breaker-api.onrender.com/v1",\n  apiKey: "cb_live_...",\n});`,
  cURL: `curl https://circuit-breaker-api.onrender.com/v1/chat/completions \\\n  -H "Authorization: Bearer cb_live_..." \\\n  -H "Content-Type: application/json" \\\n  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Hello"}]}'`,
} as const;

type Language = keyof typeof code;

export function CodeTabs() {
  const [language, setLanguage] = useState<Language>('Python');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code[language]);
      setCopied(true);
      setCopyError('');
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
      setCopyError('Clipboard access failed. Select and copy the code manually.');
    }
  };

  return (
    <div className="overflow-hidden rounded-md border border-white/[0.08] bg-[#0d0e12]">
      <div className="flex items-center justify-between border-b border-white/[0.08] px-3">
        <div role="tablist" aria-label="Code sample language" className="flex gap-1">
          {(Object.keys(code) as Language[]).map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={language === name}
              onClick={() => { setLanguage(name); setCopied(false); setCopyError(''); }}
              className={`border-b-2 px-3 py-3 font-mono text-xs ${
                language === name ? 'border-emerald-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => void copy()} className="inline-flex items-center gap-1.5 rounded px-2 py-1.5 font-mono text-[10px] text-zinc-400 hover:bg-zinc-900 hover:text-white">
          {copied ? <Check aria-hidden="true" className="h-3.5 w-3.5" /> : <Copy aria-hidden="true" className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre role="tabpanel" className="overflow-x-auto p-4 font-mono text-xs leading-6 text-zinc-300 sm:p-5"><code>{code[language]}</code></pre>
      {copyError && <p role="alert" className="border-t border-rose-900/60 px-4 py-2 text-xs text-rose-300">{copyError}</p>}
    </div>
  );
}
