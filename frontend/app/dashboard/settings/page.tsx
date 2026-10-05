'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Check, ExternalLink, Save, Send } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useDashboardContext } from '../dashboard-context';

interface ProfileSettings {
  monthly_budget_cap_usd: number | null;
  hourly_budget_cap_usd: number | null;
  daily_budget_cap_usd: number | null;
  webhook_url: string | null;
}

const freeTierLimits: ProfileSettings = {
  monthly_budget_cap_usd: 15,
  hourly_budget_cap_usd: 2,
  daily_budget_cap_usd: 10,
  webhook_url: null,
};

const checkoutUrl = (email: string | undefined, userId: string) =>
  `https://buy.polar.sh/polar_cl_4jPE6jEIy8EMhcJJX28OwVF3RFFLv0uFsc9Mv1Hgayd?customer_email=${encodeURIComponent(email || '')}&metadata[user_id]=${userId}`;
const customerPortalUrl = 'https://polar.sh/customer-portal';

function money(value: number | null) {
  return value === null ? 'Not set' : `$${Number(value).toFixed(2)}`;
}

function parseWebhookUrl(value: string) {
  const parsed = new URL(value);
  const validDiscord = ['discord.com', 'discordapp.com'].includes(parsed.hostname)
    && parsed.pathname.startsWith('/api/webhooks/');
  const validSlack = parsed.hostname === 'hooks.slack.com'
    && parsed.pathname.startsWith('/services/');

  if (parsed.protocol !== 'https:' || (!validDiscord && !validSlack)) {
    throw new Error('Enter a valid HTTPS Discord or Slack incoming webhook URL.');
  }
  return { url: parsed, isDiscord: validDiscord };
}

export default function SettingsPage() {
  const { user, tier } = useDashboardContext();
  const [profile, setProfile] = useState<ProfileSettings | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadSettings = useCallback(async () => {
    const { data, error: queryError } = await supabase
      .from('profiles')
      .select('monthly_budget_cap_usd, hourly_budget_cap_usd, daily_budget_cap_usd, webhook_url')
      .eq('id', user.id)
      .maybeSingle();

    if (queryError) {
      setError(`Unable to load settings: ${queryError.message}`);
    } else {
      const values = data ?? (tier === 'free' ? freeTierLimits : null);
      setProfile(values);
      setWebhookUrl(values?.webhook_url ?? '');
    }
    setLoading(false);
  }, [tier, user.id]);

  useEffect(() => {
    void Promise.resolve().then(() => loadSettings());
  }, [loadSettings]);

  const saveWebhook = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');

    if (webhookUrl) {
      try {
        parseWebhookUrl(webhookUrl.trim());
      } catch (validationError) {
        setError(validationError instanceof Error ? validationError.message : 'Enter a valid webhook URL.');
        setSaving(false);
        return;
      }
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ webhook_url: webhookUrl.trim() || null })
      .eq('id', user.id);

    if (updateError) {
      setError(`Unable to save webhook: ${updateError.message}`);
    } else {
      setNotice('Webhook URL saved.');
      setProfile((current) => current ? { ...current, webhook_url: webhookUrl.trim() || null } : current);
    }
    setSaving(false);
  };

  const sendTestPing = async () => {
    setError('');
    setNotice('');
    if (!webhookUrl.trim()) {
      setError('Enter and save a Discord or Slack webhook URL before sending a test ping.');
      return;
    }
    if (profile?.webhook_url !== webhookUrl.trim()) {
      setError('Save the webhook URL before sending a test ping.');
      return;
    }

    let parsedWebhook: ReturnType<typeof parseWebhookUrl>;
    try {
      parsedWebhook = parseWebhookUrl(webhookUrl.trim());
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : 'Enter a valid webhook URL.');
      return;
    }

    setTesting(true);
    try {
      const payload = parsedWebhook.isDiscord
        ? { content: 'AI Circuit Breaker test ping: emergency webhook is configured.' }
        : { text: 'AI Circuit Breaker test ping: emergency webhook is configured.' };
      const response = await fetch(parsedWebhook.url.href, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Webhook returned HTTP ${response.status}.`);
      setNotice('Test ping accepted by webhook.');
    } catch (pingError) {
      setError(pingError instanceof Error
        ? `Test ping failed: ${pingError.message}. Some webhook providers block browser requests; verify the URL or send through your server.`
        : 'Test ping failed. Verify the webhook URL or send through your server.');
    } finally {
      setTesting(false);
    }
  };

  const caps = profile ?? (tier === 'free' ? freeTierLimits : null);
  const monthlyCap = caps?.monthly_budget_cap_usd ?? (tier === 'free' ? freeTierLimits.monthly_budget_cap_usd : null);
  const hourlyCap = caps?.hourly_budget_cap_usd ?? (tier === 'free' ? freeTierLimits.hourly_budget_cap_usd : null);
  const dailyCap = caps?.daily_budget_cap_usd ?? (tier === 'free' ? freeTierLimits.daily_budget_cap_usd : null);
  const billingLink = tier === 'free' ? checkoutUrl(user.email, user.id) : customerPortalUrl;

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Workspace configuration</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">Settings &amp; alerts</h1>
      </div>

      {error && <div role="alert" className="rounded border border-rose-900 bg-rose-950/40 px-4 py-3 text-sm text-rose-300">{error}</div>}
      {notice && <div role="status" className="rounded border border-emerald-900 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300">{notice}</div>}

      <section className="rounded-md border border-white/[0.08] bg-[#0d0e12]">
        <div className="border-b border-white/[0.08] px-5 py-4">
          <h2 className="text-sm font-medium text-white">Spend rules &amp; budget caps</h2>
          <p className="mt-1 text-xs text-zinc-500">Current enforcement limits attached to your workspace.</p>
        </div>
        <div className="grid divide-y divide-white/[0.06] sm:grid-cols-3 sm:divide-y-0">
          {[
            ['Monthly cap', monthlyCap],
            ['Hourly cap', hourlyCap],
            ['Daily cap', dailyCap],
          ].map(([label, value]) => (
            <div key={label} className="px-5 py-4 sm:border-r sm:border-white/[0.06] last:border-r-0">
              <p className="text-xs text-zinc-500">{label}</p>
              <p className="mt-2 font-mono text-lg text-zinc-100">
                {loading ? 'Loading…' : money(typeof value === 'number' ? value : value === null ? null : null)}
              </p>
            </div>
          ))}
        </div>
        {tier === 'free' && (
          <p className="border-t border-white/[0.08] px-5 py-3 text-xs leading-5 text-zinc-400">
            Fixed limits: <span className="font-mono text-zinc-300">$15.00/mo</span> spend, <span className="font-mono text-zinc-300">$2.00/hr</span>, <span className="font-mono text-zinc-300">$10.00/day</span>. Upgrade to Pro to customize.
          </p>
        )}
      </section>

      <section className="rounded-md border border-white/[0.08] bg-[#0d0e12]">
        <div className="border-b border-white/[0.08] px-5 py-4">
          <h2 className="text-sm font-medium text-white">Emergency alert webhooks</h2>
          <p className="mt-1 text-xs text-zinc-500">Send loop and budget alerts to a Discord or Slack incoming webhook.</p>
        </div>
        <form onSubmit={(event) => void saveWebhook(event)} className="space-y-4 p-5">
          <div>
            <label htmlFor="webhook-url" className="mb-2 block font-mono text-xs text-zinc-400">DISCORD OR SLACK WEBHOOK URL</label>
            <input
              id="webhook-url"
              type="url"
              value={webhookUrl}
              onChange={(event) => setWebhookUrl(event.target.value)}
              placeholder="https://…"
              className="w-full rounded border border-zinc-800 bg-[#08090a] px-3 py-2.5 font-mono text-xs text-white outline-none focus:border-zinc-600"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-900 disabled:opacity-50">
              <Save aria-hidden="true" className="h-3.5 w-3.5" />
              {saving ? 'Saving…' : 'Save Webhook'}
            </button>
            <button type="button" onClick={() => void sendTestPing()} disabled={testing || !webhookUrl.trim()} className="inline-flex items-center gap-2 rounded-md border border-zinc-800 px-3 py-2 text-xs text-zinc-400 hover:bg-zinc-900 hover:text-white disabled:opacity-50">
              {testing ? <Check aria-hidden="true" className="h-3.5 w-3.5 animate-pulse" /> : <Send aria-hidden="true" className="h-3.5 w-3.5" />}
              {testing ? 'Sending…' : 'Send Test Ping'}
            </button>
          </div>
          <p className="text-[11px] leading-5 text-zinc-600">The webhook URL is stored in your workspace profile. Test pings are sent directly from this browser; provider CORS policies may reject them.</p>
        </form>
      </section>

      <section className={`rounded-md border bg-[#0d0e12] ${tier === 'free' ? 'border-emerald-900/70' : 'border-white/[0.08]'}`}>
        <div className="flex flex-wrap items-center justify-between gap-5 p-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Billing &amp; subscription</p>
            <h2 className="mt-2 text-lg font-medium text-white">{tier === 'pro' ? 'Pro subscription active' : 'Free tier'}</h2>
            <p className="mt-1 text-sm text-zinc-400">
              {tier === 'pro' ? 'Manage billing and subscription settings.' : 'Upgrade for customizable limits and expanded protection.'}
            </p>
          </div>
          <a
            href={billingLink}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
              tier === 'free'
                ? 'border-emerald-700 bg-emerald-800 text-white hover:bg-emerald-700'
                : 'border-zinc-700 text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            {tier === 'pro' ? 'Manage Subscription' : 'Upgrade to Pro ($29/mo)'}
            <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
          </a>
        </div>
      </section>
    </div>
  );
}
