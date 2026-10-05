'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Check, Copy, KeyRound, Plus, RefreshCw, ShieldCheck, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useDashboardContext } from '../dashboard-context';

interface ApiKey {
  id: string;
  key_prefix: string;
  is_active: boolean;
  created_at: string;
}

interface CreateKeyResponse {
  proxy_key?: unknown;
  key_prefix?: unknown;
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://circuit-breaker-api.onrender.com';

export default function ApiKeysPage() {
  const { user } = useDashboardContext();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [upstreamKey, setUpstreamKey] = useState('');
  const [newKey, setNewKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadKeys = useCallback(async () => {
    const { data, error: queryError } = await supabase
      .from('api_keys')
      .select('id, key_prefix, is_active, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (queryError) {
      setError(`Unable to load API keys: ${queryError.message}`);
    } else {
      setKeys(data ?? []);
    }
    setLoading(false);
  }, [user.id]);

  useEffect(() => {
    void Promise.resolve().then(() => loadKeys());
  }, [loadKeys]);

  const provisionKey = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setNotice('');
    setNewKey('');

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) throw new Error('Your session has expired. Sign in again to provision a key.');

      const response = await fetch(`${backendUrl}/v1/keys/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ upstream_key: upstreamKey }),
      });
      const payload: CreateKeyResponse & { detail?: string } = await response.json();
      if (!response.ok) throw new Error(payload.detail || `Key provisioning failed (${response.status}).`);
      if (typeof payload.proxy_key !== 'string' || !payload.proxy_key) {
        throw new Error('The key service returned an invalid response. No key was displayed.');
      }

      setNewKey(payload.proxy_key);
      setUpstreamKey('');
      setNotice('Protected key provisioned. Copy it now; it will not be shown again.');
      await loadKeys();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to provision key.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyNewKey = async () => {
    try {
      await navigator.clipboard.writeText(newKey);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Clipboard access was denied. Select and copy the key manually.');
    }
  };

  const revokeKey = async (key: ApiKey) => {
    if (!window.confirm(`Delete API key ${key.key_prefix}? This action cannot be undone.`)) return;
    setDeletingId(key.id);
    setError('');
    setNotice('');

    const { error: deleteError } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', key.id)
      .eq('user_id', user.id);

    if (deleteError) {
      setError(`Unable to revoke API key: ${deleteError.message}`);
    } else {
      setKeys((current) => current.filter(({ id }) => id !== key.id));
      setNotice(`API key ${key.key_prefix} was revoked.`);
    }
    setDeletingId(null);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Gateway credentials</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">API keys</h1>
          <p className="mt-2 text-sm text-zinc-400">Create protected keys for routing requests through the gateway.</p>
        </div>
        <button
          type="button"
          onClick={() => { setModalOpen(true); setError(''); setNewKey(''); }}
          className="inline-flex items-center gap-2 rounded-md bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-950 shadow-sm transition hover:bg-white"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          Provision Protected Key
        </button>
      </div>

      {error && <div role="alert" className="rounded border border-rose-900 bg-rose-950/40 px-4 py-3 text-sm text-rose-300">{error}</div>}
      {notice && <div role="status" className="rounded border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-300">{notice}</div>}

      <section className="overflow-hidden rounded-md border border-white/[0.08] bg-[#0d0e12]">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
          <div className="flex items-center gap-2">
            <KeyRound aria-hidden="true" className="h-4 w-4 text-zinc-500" />
            <h2 className="text-sm font-medium text-zinc-200">Provisioned keys</h2>
          </div>
          <button type="button" onClick={() => void loadKeys()} aria-label="Refresh API keys" className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-900 hover:text-white">
            <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-xs">
            <thead className="border-b border-white/[0.08] font-mono uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-normal">Key prefix</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal">Created date</th>
                <th className="px-4 py-3 text-right font-normal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {keys.map((key) => (
                <tr key={key.id} className="hover:bg-zinc-900/50">
                  <td className="px-4 py-3 font-mono text-zinc-200">{key.key_prefix}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2 font-mono text-zinc-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                      {key.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-zinc-400">{new Date(key.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => void revokeKey(key)}
                      disabled={deletingId === key.id}
                      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-zinc-500 hover:bg-rose-950/40 hover:text-rose-300 disabled:opacity-50"
                      aria-label={`Revoke ${key.key_prefix}`}
                    >
                      <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && keys.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-zinc-500">No API keys provisioned.</td></tr>
              )}
              {loading && <tr><td colSpan={4} className="px-4 py-10 text-center font-mono text-zinc-600">Loading API keys…</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="provision-title" className="w-full max-w-xl rounded-md border border-zinc-800 bg-[#0d0e12] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
              <div>
                <h2 id="provision-title" className="text-base font-semibold text-white">Provision protected key</h2>
                <p className="mt-1 text-xs text-zinc-500">Create a gateway key bound to your upstream provider credential.</p>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} aria-label="Close provision form" className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-900 hover:text-white">
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              {error && <div role="alert" className="rounded border border-rose-900 bg-rose-950/40 px-3 py-2 text-xs text-rose-300">{error}</div>}
              {newKey ? (
                <div className="space-y-4">
                  <div className="flex gap-2 rounded border border-amber-900/70 bg-amber-950/30 p-3 text-xs leading-5 text-amber-200">
                    <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                    Copy this key now. For security, the full value is shown only once and cannot be retrieved later.
                  </div>
                  <div className="flex items-center gap-2 rounded border border-zinc-800 bg-[#090a0f] p-3">
                    <code className="min-w-0 flex-1 break-all font-mono text-xs text-zinc-200">{newKey}</code>
                    <button type="button" onClick={() => void copyNewKey()} className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-zinc-700 px-2.5 py-2 text-xs text-zinc-200 hover:bg-zinc-900">
                      {copied ? <Check aria-hidden="true" className="h-3.5 w-3.5" /> : <Copy aria-hidden="true" className="h-3.5 w-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <button type="button" onClick={() => { setModalOpen(false); setNewKey(''); }} className="rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-900">Done</button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 rounded border border-zinc-800 bg-zinc-900/50 p-3 text-xs leading-5 text-zinc-300">
                    <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                    Encrypted with AES-256 (Fernet) prior to database insertion. Raw keys are never logged or exposed in plaintext.
                  </div>
                  <form onSubmit={(event) => void provisionKey(event)} className="space-y-4">
                    <div>
                      <label htmlFor="upstream-key" className="mb-2 block font-mono text-xs text-zinc-400">UPSTREAM OPENAI API KEY</label>
                      <input
                        id="upstream-key"
                        type="password"
                        autoComplete="off"
                        required
                        minLength={8}
                        value={upstreamKey}
                        onChange={(event) => setUpstreamKey(event.target.value)}
                        placeholder="sk-proj-…"
                        className="w-full rounded border border-zinc-800 bg-[#090a0f] px-3 py-2.5 font-mono text-xs text-white outline-none focus:border-zinc-600"
                      />
                    </div>
                    <button type="submit" disabled={submitting} className="rounded-md bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-950 shadow-sm transition hover:bg-white disabled:opacity-50">
                      {submitting ? 'Provisioning…' : 'Provision Protected Key'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
