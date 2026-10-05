'use client';

import { KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { ChevronDown, RefreshCw, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useDashboardContext } from '../dashboard-context';

interface RequestLog {
  id: string;
  user_id: string;
  api_key_id: string | null;
  session_id: string | null;
  model: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  cost_usd: number | null;
  status_code: number | null;
  was_blocked: boolean | null;
  blocked_reason: string | null;
  created_at: string;
  prompt_hash?: string | null;
  [key: string]: unknown;
}

type StatusFilter = 'all' | 'blocked' | 'passed';
type ModelFilter = 'all' | 'gpt-4o' | 'gpt-4o-mini';

function statusDetails(log: RequestLog) {
  if (log.status_code === 429 || (log.blocked_reason ?? '').toLowerCase().includes('budget')) {
    return { label: '429 BUDGET_EXCEEDED', className: 'border-amber-900 bg-amber-950/40 text-amber-300' };
  }
  if (log.was_blocked) {
    return { label: '400 LOOP_KILLED', className: 'border-rose-900 bg-rose-950/40 text-rose-300' };
  }
  return { label: `${log.status_code ?? 200} OK`, className: 'border-emerald-900 bg-emerald-950/40 text-emerald-300' };
}

export default function RequestLogsPage() {
  const { user } = useDashboardContext();
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [modelFilter, setModelFilter] = useState<ModelFilter>('all');
  const [selectedLog, setSelectedLog] = useState<RequestLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadLogs = useCallback(async (manual = false) => {
    if (manual) {
      setRefreshing(true);
      setError('');
    }
    const { data, error: queryError } = await supabase
      .from('request_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (queryError) {
      setError(`Unable to load request logs: ${queryError.message}`);
    } else {
      setLogs((data ?? []) as RequestLog[]);
    }
    setLoading(false);
    setRefreshing(false);
  }, [user.id]);

  useEffect(() => {
    void Promise.resolve().then(() => loadLogs());
  }, [loadLogs]);

  const filteredLogs = logs.filter((log) => {
    const matchesStatus = statusFilter === 'all'
      || (statusFilter === 'blocked' && Boolean(log.was_blocked) && log.status_code === 400)
      || (statusFilter === 'passed' && !log.was_blocked);
    return matchesStatus && (modelFilter === 'all' || log.model === modelFilter);
  });

  const openOnKeyboard = (event: KeyboardEvent<HTMLTableRowElement>, log: RequestLog) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setSelectedLog(log);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Traffic inspection</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">Request logs</h1>
          <p className="mt-2 text-sm text-zinc-400">Inspect the latest 50 requests routed through your gateway.</p>
        </div>
        <button
          type="button"
          onClick={() => void loadLogs(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-md border border-zinc-800 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-900 disabled:opacity-50"
        >
          <RefreshCw aria-hidden="true" className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Logs
        </button>
      </div>

      {error && <div role="alert" className="rounded border border-rose-900 bg-rose-950/40 px-4 py-3 text-sm text-rose-300">{error}</div>}

      <section className="rounded-md border border-white/[0.08] bg-[#0d0e12]">
        <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.08] px-4 py-3">
          <label className="flex items-center gap-2 text-xs text-zinc-500">
            STATUS
            <span className="relative">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                className="appearance-none rounded border border-zinc-800 bg-[#08090a] py-1.5 pl-2.5 pr-7 text-xs text-zinc-200 outline-none focus:border-zinc-600"
              >
                <option value="all">All</option>
                <option value="blocked">Blocked Loops Only</option>
                <option value="passed">Passed Only</option>
              </select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-500" />
            </span>
          </label>
          <label className="flex items-center gap-2 text-xs text-zinc-500">
            MODEL
            <span className="relative">
              <select
                value={modelFilter}
                onChange={(event) => setModelFilter(event.target.value as ModelFilter)}
                className="appearance-none rounded border border-zinc-800 bg-[#08090a] py-1.5 pl-2.5 pr-7 text-xs text-zinc-200 outline-none focus:border-zinc-600"
              >
                <option value="all">All models</option>
                <option value="gpt-4o">gpt-4o</option>
                <option value="gpt-4o-mini">gpt-4o-mini</option>
              </select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-500" />
            </span>
          </label>
          <span className="ml-auto font-mono text-[11px] text-zinc-600">{filteredLogs.length} / {logs.length} rows</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left text-xs">
            <thead className="border-b border-white/[0.08] font-mono uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-3 py-3 font-normal">Timestamp</th>
                <th className="px-3 py-3 font-normal">Status</th>
                <th className="px-3 py-3 font-normal">Model</th>
                <th className="px-3 py-3 font-normal">Tokens (In / Out)</th>
                <th className="px-3 py-3 text-right font-normal">Cost</th>
                <th className="px-3 py-3 font-normal">Session ID</th>
                <th className="px-3 py-3 font-normal">Incident reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filteredLogs.map((log) => {
                const status = statusDetails(log);
                return (
                  <tr
                    key={log.id}
                    tabIndex={0}
                    role="button"
                    aria-label={`Inspect request ${log.id}`}
                    onClick={() => setSelectedLog(log)}
                    onKeyDown={(event) => openOnKeyboard(event, log)}
                    className="cursor-pointer outline-none hover:bg-zinc-900/50 focus:bg-zinc-900/50"
                  >
                    <td className="whitespace-nowrap px-3 py-3 font-mono text-zinc-400">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex whitespace-nowrap rounded border px-2 py-1 font-mono text-[10px] ${status.className}`}>{status.label}</span>
                    </td>
                    <td className="px-3 py-3 font-mono text-zinc-300">{log.model || '—'}</td>
                    <td className="whitespace-nowrap px-3 py-3 font-mono text-zinc-400">{(log.input_tokens ?? 0).toLocaleString()} / {(log.output_tokens ?? 0).toLocaleString()}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-right font-mono text-zinc-300">${Number(log.cost_usd ?? 0).toFixed(6)}</td>
                    <td className="max-w-36 truncate px-3 py-3 font-mono text-zinc-500">{log.session_id || '—'}</td>
                    <td className="max-w-52 truncate px-3 py-3 text-zinc-500">{log.blocked_reason || '—'}</td>
                  </tr>
                );
              })}
              {!loading && filteredLogs.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-zinc-500">No requests match these filters.</td></tr>
              )}
              {loading && <tr><td colSpan={7} className="px-4 py-12 text-center font-mono text-zinc-600">Loading request logs…</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {selectedLog && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/65" onClick={() => setSelectedLog(null)}>
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="log-detail-title"
            onClick={(event) => event.stopPropagation()}
            className="flex h-full w-full max-w-xl flex-col border-l border-white/[0.08] bg-[#0a0b0e]"
          >
            <div className="flex items-start justify-between border-b border-white/[0.08] px-5 py-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Request detail</p>
                <h2 id="log-detail-title" className="mt-1 text-base font-medium text-white">{selectedLog.id}</h2>
              </div>
              <button type="button" onClick={() => setSelectedLog(null)} aria-label="Close request details" className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-900 hover:text-white">
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
              <dl className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-3 text-xs">
                {[
                  ['Session ID', selectedLog.session_id || 'Not recorded'],
                  ['Model', selectedLog.model || 'Not recorded'],
                  ['Prompt hash', selectedLog.prompt_hash || 'Not available in request_logs'],
                  ['Blocked reason', selectedLog.blocked_reason || 'None'],
                  ['Timestamp', new Date(selectedLog.created_at).toISOString()],
                ].map(([label, value]) => (
                  <div key={label} className="contents">
                    <dt className="font-mono text-zinc-500">{label}</dt>
                    <dd className="break-all font-mono text-zinc-300">{value}</dd>
                  </div>
                ))}
              </dl>
              <div>
                <h3 className="mb-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500">Full JSON metadata</h3>
                <pre className="max-h-[55vh] overflow-auto rounded border border-zinc-800 bg-[#08090a] p-3 font-mono text-[11px] leading-5 text-zinc-300">{JSON.stringify(selectedLog, null, 2)}</pre>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
