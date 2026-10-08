'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

const code = {
  Python: `from openai import OpenAI\n\nclient = OpenAI(\n    base_url="https://circuit-breaker-api.onrender.com/v1",\n    api_key="cb_live_...",\n)`,
  TypeScript: `import OpenAI from "openai";\n\nconst client = new OpenAI({\n  baseURL: "https://circuit-breaker-api.onrender.com/v1",\n  apiKey: "cb_live_...",\n});`,
  cURL: `curl https://circuit-breaker-api.onrender.com/v1/chat/completions \\\n  -H "Authorization: Bearer cb_live_..." \\\n  -H "Content-Type: application/json" \\\n  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Hello"}]}'`,
} as const;

type Language = keyof typeof code;

function highlightCode(source: string) {
  const parts = source.split(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b(?:from|import|const|new|base_url|baseURL|api_key|apiKey|curl|POST|false|true)\b)/g);

  return parts.map((part, index) => {
    const isString = part.startsWith('"') || part.startsWith("'");
    const isKeyword = /^(from|import|const|new|curl|POST|false|true)$/.test(part);
    const isProperty = /^(base_url|baseURL|api_key|apiKey)$/.test(part);

    if (!isString && !isKeyword && !isProperty) return part;
    const color = isString ? 'text-zinc-400' : isKeyword ? 'text-zinc-100' : 'text-zinc-300';
    return <span key={`${part}-${index}`} className={color}>{part}</span>;
  });
}

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
    <div className="overflow-hidden rounded-md border border-white/[0.08] bg-[#0e1016]">
      <div className="flex items-center justify-between border-b border-white/[0.08] px-3">
        <div role="tablist" aria-label="Code sample language" className="flex gap-1">
          {(Object.keys(code) as Language[]).map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={language === name}
              onClick={() => { setLanguage(name); setCopied(false); setCopyError(''); }}
              className={`border-b px-3 py-3 font-mono text-xs ${
                language === name ? 'border-sky-400 text-sky-300' : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => void copy()} className="inline-flex items-center gap-2 rounded px-3 py-2 font-mono text-xs text-zinc-300 transition-colors duration-150 ease-out hover:bg-zinc-900 hover:text-sky-400">
          {copied ? <Check aria-hidden="true" className="h-4 w-4" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre role="tabpanel" className="min-w-0 overflow-x-auto p-4 font-mono text-xs leading-[1.5] text-zinc-300 sm:p-6"><code>{highlightCode(code[language])}</code></pre>
      {copyError && <p role="alert" className="border-t border-rose-900/60 px-4 py-2 text-xs text-[#f87171]">{copyError}</p>}
    </div>
  );
}
