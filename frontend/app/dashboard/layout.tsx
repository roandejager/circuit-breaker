'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  Key,
  LogOut,
  Menu,
  Settings,
  ShieldAlert,
  Terminal,
  X,
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { AccountTier, DashboardContext } from './dashboard-context';

const navigation = [
  { label: 'Overview', href: '/dashboard', icon: Activity },
  { label: 'API Keys', href: '/dashboard/keys', icon: Key },
  { label: 'Request Logs', href: '/dashboard/logs', icon: Terminal },
  { label: 'Settings & Alerts', href: '/dashboard/settings', icon: Settings },
];

function routeTitle(pathname: string) {
  const item = navigation.find(({ href }) => href === pathname);
  if (item) return item.label;
  if (pathname.startsWith('/dashboard/keys')) return 'API Keys';
  if (pathname.startsWith('/dashboard/logs')) return 'Request Logs';
  if (pathname.startsWith('/dashboard/settings')) return 'Settings & Alerts';
  return 'Overview';
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tier, setTier] = useState<AccountTier>('free');
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const loadAccount = useCallback(async (account: User) => {
    setUser(account);
    const { data, error } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', account.id)
      .maybeSingle();

    if (error) {
      setProfileError(`Unable to load account tier: ${error.message}`);
      return;
    }

    setProfileError('');
    setTier(data?.tier === 'pro' ? 'pro' : 'free');
  }, []);

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;

      if (error) {
        setProfileError(`Unable to verify your session: ${error.message}`);
      }
      if (!data.session) {
        router.replace('/login');
        setLoading(false);
        return;
      }

      await loadAccount(data.session.user);
      if (active) setLoading(false);
    };

    void initialize();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        router.replace('/login');
        return;
      }
      void loadAccount(session.user);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [loadAccount, router]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setProfileError(`Unable to sign out: ${error.message}`);
      return;
    }
    router.replace('/');
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-[#0a0b0e]">
      <div className="flex h-16 items-center justify-between border-b border-white/[0.08] px-5">
        <Link href="/" className="flex min-w-0 items-center gap-2 text-sm font-semibold tracking-tight text-white" onClick={() => setMobileNavOpen(false)}>
          <ShieldAlert aria-hidden="true" className="h-5 w-5 shrink-0 text-emerald-400" />
          <span className="truncate">AI Circuit Breaker</span>
        </Link>
        <span className="ml-2 rounded border border-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">v0.1.0</span>
      </div>

      <nav aria-label="Dashboard navigation" className="flex-1 space-y-1 px-3 py-5">
        {navigation.map(({ label, href, icon: Icon }) => {
          const active = href === '/dashboard'
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileNavOpen(false)}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${
                active ? 'bg-zinc-800/60 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.08] p-4">
        <div className="mb-4 flex items-center gap-2 font-mono text-[11px] text-zinc-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Frankfurt EU-Central Online
        </div>
        <p className="truncate text-xs text-zinc-300" title={user?.email ?? undefined}>{user?.email}</p>
        <span className={`mt-2 inline-flex rounded border px-2 py-1 font-mono text-[10px] tracking-wide ${
          tier === 'pro'
            ? 'border-emerald-900 bg-emerald-950/40 text-emerald-300'
            : 'border-zinc-800 bg-zinc-900 text-zinc-400'
        }`}>
          {tier === 'pro' ? 'PRO TIER ACTIVE' : 'FREE TIER'}
        </span>
        <button
          type="button"
          onClick={() => void signOut()}
          className="mt-4 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
        >
          <LogOut aria-hidden="true" className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08090a] font-mono text-sm text-zinc-400">
        Checking your session…
      </main>
    );
  }

  return (
    <DashboardContext.Provider value={{ user, tier }}>
      <div className="min-h-screen bg-[#08090a] text-zinc-100">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/[0.08] lg:block">
          {sidebar}
        </aside>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute inset-0 bg-black/70"
              onClick={() => setMobileNavOpen(false)}
            />
            <aside className="relative h-full w-72 max-w-[85vw] border-r border-white/[0.08]">
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setMobileNavOpen(false)}
                className="absolute right-3 top-5 z-10 rounded-md p-1 text-zinc-400 hover:text-white"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
              {sidebar}
            </aside>
          </div>
        )}

        <div className="lg:pl-64">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/[0.08] bg-[#0a0b0e] px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Open navigation"
                onClick={() => setMobileNavOpen(true)}
                className="rounded-md p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white lg:hidden"
              >
                <Menu aria-hidden="true" className="h-4 w-4" />
              </button>
              <div aria-label={`Dashboard, ${routeTitle(pathname)}`} className="flex items-center gap-2 truncate text-sm">
                <span className="text-zinc-500">Dashboard</span>
                <span aria-hidden="true" className="text-zinc-700">/</span>
                <span className="truncate text-zinc-200">{routeTitle(pathname)}</span>
              </div>
            </div>
            {tier === 'free' && (
              <a
                href={`https://buy.polar.sh/polar_cl_4jPE6jEIy8EMhcJJX28OwVF3RFFLv0uFsc9Mv1Hgayd?customer_email=${encodeURIComponent(user.email || '')}&metadata[user_id]=${user.id}`}
                target="_blank"
                rel="noreferrer"
                className="ml-3 inline-flex shrink-0 items-center gap-1.5 rounded-md border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-300 transition hover:border-zinc-500 hover:text-white sm:px-3"
              >
                <span className="hidden sm:inline">Upgrade to Pro</span>
                <span className="sm:hidden">Upgrade</span>
                <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
              </a>
            )}
          </header>
          <main className="p-4 sm:p-6 lg:p-8">
            {profileError && (
              <div role="alert" className="mb-5 rounded border border-rose-900 bg-rose-950/40 px-4 py-3 text-sm text-rose-300">
                {profileError}
              </div>
            )}
            {children}
          </main>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}
