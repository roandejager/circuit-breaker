'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Activity, ArrowRight, Clock3, KeyRound, RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useDashboardContext } from './dashboard-context';

interface RequestLog {
  id: string;
  session_id: string | null;
  model: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  cost_usd: number | null;
  status_code: number | null;
  was_blocked: boolean | null;
  blocked_reason: string | null;
  created_at: string;
}

interface ApiKey {
  key_prefix: string;
  created_at: string;
}

const metrics = [
  { key: 'spend', label: 'Total spend', icon: Activity, format: (value: number) => `$${value.toFixed(4)}` },
  { key: 'requests', label: 'Requests processed', icon: ArrowRight, format: (value: number) => value.toLocaleString() },
  { key: 'blocked', label: 'Loops terminated', icon: ShieldAlert, format: (value: number) => value.toLocaleString() },
  { key: 'saved', label: 'Estimated dollars saved', icon: ShieldCheck, format: (value: number) => `$${value.toFixed(2)}` },
] as const;

export default function DashboardPage() {
  const { user } = useDashboardContext();
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [latestKey, setLatestKey] = useState<ApiKey | null>(null);
  const [snippetLanguage, setSnippetLanguage] = useState<'python' | 'javascript' | 'curl'>('python');
  const [totalRequests, setTotalRequests] = useState(0);
  const [usageTotals, setUsageTotals] = useState({ spend: 0, blocked: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async (showSpinner = false) => {
    if (showSpinner) {
      setRefreshing(true);
      setError('');
    }

    const fetchUsage = async () => {
      const incidentRows: RequestLog[] = [];
      let spendTotal = 0;
      let blockedTotal = 0;
      let offset = 0;
      let queryError: string | null = null;

      while (true) {
        const { data, error: pageError } = await supabase
          .from('request_logs')
          .select('id, session_id, model, input_tokens, output_tokens, cost_usd, status_code, was_blocked, blocked_reason, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(offset, offset + 999);

        if (pageError) {
          queryError = pageError.message;
          break;
        }

        const page = (data ?? []) as RequestLog[];
        for (const row of page) {
          spendTotal += Number(row.cost_usd ?? 0);
          if (row.was_blocked && row.status_code === 400) {
            blockedTotal += 1;
            if (incidentRows.length < 3) incidentRows.push(row);
          }
        }
        offset += page.length;
        if (page.length < 1000) break;
      }

      return { incidentRows, spendTotal, blockedTotal, queryError };
    };

    const [logsResponse, countResponse, keyResponse] = await Promise.all([
      fetchUsage(),
      supabase
        .from('request_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
      supabase
        .from('api_keys')
        .select('key_prefix, created_at')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const failures = [
      logsResponse.queryError,
      countResponse.error?.message,
      keyResponse.error?.message,
    ].filter((failure): failure is string => Boolean(failure));
    if (failures.length) {
      setError(`Unable to load dashboard data: ${failures.join('; ')}`);
    } else {
      setLogs(logsResponse.incidentRows);
      setUsageTotals({ spend: logsResponse.spendTotal, blocked: logsResponse.blockedTotal });
      setTotalRequests(countResponse.count ?? 0);
      setLatestKey(keyResponse.data);
    }

    setLoading(false);
    setRefreshing(false);
  }, [user.id]);

  useEffect(() => {
    void Promise.resolve().then(() => loadDashboard());
  }, [loadDashboard]);

  const values = {
    spend: usageTotals.spend,
    requests: totalRequests,
    blocked: usageTotals.blocked,
    saved: usageTotals.blocked * 35,
  };
  const snippetKey = latestKey?.key_prefix ?? 'cb_live_...';
  const snippets = {
    python: `from openai import OpenAI\n\nclient = OpenAI(\n    base_url="https://circuit-breaker-api.onrender.com/v1",\n    api_key="${snippetKey}"\n)`,
    javascript: `import OpenAI from "openai";\n\nconst client = new OpenAI({\n  baseURL: "https://circuit-breaker-api.onrender.com/v1",\n  apiKey: "${snippetKey}",\n});`,
    curl: `curl https://circuit-breaker-api.onrender.com/v1/chat/completions \\\n  -H "Authorization: Bearer ${snippetKey}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Hello"}]}'`,
  };

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Workspace overview</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">Gateway telemetry</h1>
        </div>
        <button
          type="button"
          onClick={() => void loadDashboard(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-md border border-zinc-800 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-900 disabled:opacity-50"
        >
          <RefreshCw aria-hidden="true" className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div role="alert" className="rounded border border-rose-900 bg-rose-950/40 px-4 py-3 text-sm text-rose-300">{error}</div>
      )}

      <section aria-label="Usage metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ key, label, icon: Icon, format }) => (
          <article key={key} className="rounded-md border border-white/[0.08] bg-[#0d0e12] p-4 transition-colors hover:border-sky-500/40">
            <div className="flex items-center justify-between gap-3 text-xs text-zinc-400">
              {label}
              <Icon aria-hidden="true" className="h-4 w-4 text-zinc-600" />
            </div>
            <p className="mt-4 font-mono text-2xl tracking-tight text-sky-400">
              {loading ? <span className="inline-block h-7 w-24 animate-pulse rounded bg-zinc-800" /> : format(values[key])}
            </p>
          </article>
        ))}
      </section>

      <section aria-label="Gateway status" className="rounded-md border border-white/[0.08] bg-[#0d0e12]">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
          <h2 className="text-sm font-medium text-zinc-200">Gateway status</h2>
          <span className="inline-flex items-center gap-2 rounded border border-sky-500/20 bg-sky-500/10 px-2 py-1 font-mono text-[11px] text-sky-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400 shadow-[0_0_8px_#38BDF8]" /> OPERATIONAL
          </span>
        </div>
        <div className="grid divide-y divide-white/[0.08] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
          {[
            ['Active region', 'Frankfurt EU-Central'],
            ['Uptime', '99.98%'],
            ['Average proxy latency', '<35ms'],
            ['Protocol', 'SSE HTTP/2'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 px-4 py-3 sm:block sm:border-r sm:border-white/[0.08] last:border-r-0">
              <p className="text-xs text-zinc-500">{label}</p>
              <p className="mt-0.5 font-mono text-sm text-zinc-200">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">
        <article className="rounded-md border border-white/[0.08] bg-[#0d0e12] transition-colors hover:border-sky-500/40">
          <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
            <div className="flex items-center gap-2">
              <KeyRound aria-hidden="true" className="h-4 w-4 text-zinc-500" />
              <h2 className="text-sm font-medium text-zinc-200">Quick start</h2>
            </div>
            <Link href="/dashboard/keys" className="font-mono text-[11px] text-zinc-400 hover:text-zinc-200">Manage keys</Link>
          </div>
          <div className="p-4">
            <p className="mb-3 text-xs text-zinc-500">
              {latestKey
                ? `Active key prefix: ${snippetKey}. Replace it with the full key copied at creation; the full secret cannot be retrieved.`
                : 'Provision a protected key to start routing requests.'}
            </p>
            <div className="mb-2 flex gap-1" role="tablist" aria-label="Code sample language">
              {(['python', 'javascript', 'curl'] as const).map((language) => (
                <button
                  key={language}
                  type="button"
                  role="tab"
                  aria-selected={snippetLanguage === language}
                  onClick={() => setSnippetLanguage(language)}
                  className={`rounded px-2 py-1 font-mono text-[10px] ${
                    snippetLanguage === language ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-200'
                  }`}
                >
                  {language}
                </button>
              ))}
            </div>
            <pre className="overflow-x-auto rounded border border-zinc-800 bg-[#090a0f] p-4 font-mono text-xs leading-6 text-zinc-300"><code>{snippets[snippetLanguage]}</code></pre>
            {!latestKey && (
              <Link href="/dashboard/keys" className="mt-3 inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200">
                Provision your first key <ArrowRight aria-hidden="true" className="h-3 w-3" />
              </Link>
            )}
          </div>
        </article>

        <article className="rounded-md border border-white/[0.08] bg-[#0d0e12] transition-colors hover:border-sky-500/40">
          <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
            <div className="flex items-center gap-2">
              <Clock3 aria-hidden="true" className="h-4 w-4 text-zinc-500" />
              <h2 className="text-sm font-medium text-zinc-200">Recent incidents</h2>
            </div>
            <Link href="/dashboard/logs" className="font-mono text-[11px] text-zinc-400 hover:text-zinc-200">View logs</Link>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {logs.filter((log) => log.was_blocked).slice(0, 3).map((incident) => (
              <div key={incident.id} className="px-4 py-3 hover:bg-zinc-900/50">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate font-mono text-xs text-rose-300">{incident.blocked_reason || 'Request blocked'}</span>
                  <time className="shrink-0 font-mono text-[10px] text-zinc-500" dateTime={incident.created_at}>
                    {new Date(incident.created_at).toLocaleString()}
                  </time>
                </div>
                <p className="mt-1 font-mono text-[10px] text-zinc-600">{incident.model || 'Unknown model'} · {incident.session_id || 'No session ID'}</p>
              </div>
            ))}
            {!loading && logs.length === 0 && (
              <p className="px-4 py-6 text-xs text-zinc-500">No blocked loop incidents found.</p>
            )}
            {loading && <p className="px-4 py-6 font-mono text-xs text-zinc-600">Loading incidents…</p>}
          </div>
        </article>
      </section>
    </div>
  );
}
