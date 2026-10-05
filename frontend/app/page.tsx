'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  ShieldAlert, 
  Key, 
  Check, 
  Copy, 
  Zap, 
  LogOut, 
  DollarSign, 
  Activity, 
  Code2, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface Stats {
  totalSpend: number;
  totalRequests: number;
  loopsBlocked: number;
  dollarsSaved: number;
}

interface ApiKeyRecord {
  id: string;
  key_prefix: string;
  created_at: string;
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Auth state
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Key Generation State
  const [upstreamKey, setUpstreamKey] = useState('');
  const [generatingKey, setGeneratingKey] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [keyError, setKeyError] = useState('');
  const [keysList, setKeysList] = useState<ApiKeyRecord[]>([]);

  // Live Stats State
  const [stats, setStats] = useState<Stats>({
    totalSpend: 0,
    totalRequests: 0,
    loopsBlocked: 0,
    dollarsSaved: 0
  });

  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        loadDashboardData(session.user.id);
      }
      setLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        loadDashboardData(session.user.id);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loadDashboardData = async (userId: string) => {
    // 1. Fetch user's profile and tier
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileData) setProfile(profileData);

    // 2. Fetch user's API keys
    const { data: keys } = await supabase
      .from('api_keys')
      .select('id, key_prefix, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (keys) setKeysList(keys);

    // 3. Fetch spend & loop stats
    const { data: logs } = await supabase
      .from('request_logs')
      .select('cost_usd, was_blocked, blocked_reason')
      .eq('user_id', userId);

    if (logs) {
      let spend = 0;
      let blockedCount = 0;

      logs.forEach((log) => {
        spend += Number(log.cost_usd || 0);
        if (log.was_blocked) {
          blockedCount += 1;
        }
      });

      const saved = blockedCount * 35.00;

      setStats({
        totalSpend: Number(spend.toFixed(4)),
        totalRequests: logs.length,
        loopsBlocked: blockedCount,
        dollarsSaved: Number(saved.toFixed(2))
      });
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Account created! Logging you in...');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setNewKey(null);
  };

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingKey(true);
    setKeyError('');

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/v1/keys/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          upstream_key: upstreamKey
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to generate key');
      }

      setNewKey(data.proxy_key);
      setUpstreamKey('');
      loadDashboardData(user.id);
    } catch (err: any) {
      setKeyError(err.message || 'Key generation error');
    } finally {
      setGeneratingKey(false);
    }
  };

  const isPro = profile?.tier === 'pro';
  const polarCheckoutUrl = `https://buy.polar.sh/polar_cl_4jPE6jEIy8EMhcJJX28OwVF3RFFLv0uFsc9Mv1Hgayd?customer_email=${encodeURIComponent(user?.email || '')}&metadata[user_id]=${user?.id || ''}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center font-mono">
        <Activity className="w-6 h-6 animate-spin text-emerald-500 mr-2" />
        Initializing Circuit Breaker...
      </div>
    );
  }

  // --- LOGGED-OUT VIEW ---
  if (!user) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
        <nav className="border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
          <div className="flex items-center space-x-2 font-mono font-bold text-lg tracking-tight">
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
            <span>AI Circuit Breaker</span>
          </div>
          <button 
            onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
            className="text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition"
          >
            {authMode === 'login' ? 'Need an account? Sign up' : 'Have an account? Log in'}
          </button>
        </nav>

        <div className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-mono mb-6">
              <Zap className="w-3.5 h-3.5" />
              <span>Zero-Overhead Agent Firewall</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white mb-6">
              Never wake up to an <span className="text-emerald-400 underline decoration-emerald-500/50">$800 OpenAI</span> loop surprise.
            </h1>
            <p className="text-zinc-400 text-base leading-relaxed mb-8">
              Autonomous AI agents often enter recursive infinite loops when tool executions fail. 
              Drop in our lightweight reverse proxy with <strong>one line of code</strong>. We detect repetition cycles, enforce hard dollar caps, and kill runaway agents instantly.
            </p>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-xs text-zinc-300">
              <div className="text-zinc-500 mb-2"># 1-Line Drop-In Protection:</div>
              <div className="text-emerald-400 font-bold">client = OpenAI(</div>
              <div className="pl-4 text-zinc-300">base_url="http://localhost:8000/v1",</div>
              <div className="pl-4 text-zinc-300">api_key="cb_live_..."</div>
              <div className="text-emerald-400 font-bold">)</div>
            </div>
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800 p-8 rounded-xl shadow-2xl">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-1">
                {authMode === 'login' ? 'Developer Access' : 'Create Free Account'}
              </h2>
              <p className="text-zinc-400 text-xs">
                Free tier includes up to $15.00/month of monitored LLM spend.
              </p>
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                {authError}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">EMAIL ADDRESS</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@company.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">PASSWORD</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-2.5 rounded transition text-sm flex items-center justify-center space-x-2"
              >
                {authLoading ? (
                  <Activity className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{authMode === 'login' ? 'Sign In' : 'Get Free Proxy Key'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <footer className="border-t border-zinc-900 py-6 text-center text-xs font-mono text-zinc-600">
          Built for autonomous AI engineers. Zero downtime SLA.
        </footer>
      </main>
    );
  }

  // --- LOGGED-IN: SAAS DEVELOPER DASHBOARD ---
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      <header className="border-b border-zinc-800/80 px-8 py-4 flex items-center justify-between bg-zinc-950/60 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <ShieldAlert className="w-5 h-5 text-emerald-400" />
          <span className="font-mono font-bold text-sm tracking-tight text-white">AI Circuit Breaker</span>
          <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
            isPro 
              ? 'bg-purple-950 text-purple-400 border-purple-800/60 font-bold' 
              : 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
          }`}>
            {isPro ? 'PRO TIER ACTIVE' : 'FREE TIER'}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-xs font-mono text-zinc-400 hidden sm:inline">{user.email}</span>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 text-xs font-mono text-zinc-400 hover:text-white transition border border-zinc-800 px-3 py-1.5 rounded hover:bg-zinc-900"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto w-full px-6 py-8 flex-1 space-y-8">
        {/* Monetization Banner (Hides if already Pro) */}
        {!isPro ? (
          <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-800/50 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono font-bold mb-1">
                <Zap className="w-4 h-4" />
                <span>PRO TIER AVAILABLE</span>
              </div>
              <h3 className="text-lg font-bold text-white">Unlock Unlimited Monitored Spend & Instant Webhook Kills</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                Pro includes unlimited agent sessions, custom Slack/Discord emergency webhooks, and sub-second infinite loop termination for $29/month.
              </p>
            </div>
            <a
              href={polarCheckoutUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-5 py-2.5 rounded text-xs font-mono transition flex items-center space-x-2 whitespace-nowrap shadow-lg shadow-emerald-500/10"
            >
              <span>Upgrade to Pro ($29/mo)</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <div className="bg-purple-950/20 border border-purple-800/40 rounded-xl p-4 flex items-center space-x-3 text-purple-300 text-xs font-mono">
            <ShieldCheck className="w-5 h-5 text-purple-400 flex-shrink-0" />
            <span>PRO SUBSCRIBER: Hard limits elevated. Unlimited sessions active with zero rate throttling.</span>
          </div>
        )}

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-5">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-mono">TOTAL MONITORED SPEND</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">${stats.totalSpend.toFixed(4)}</div>
            <div className="text-[11px] text-zinc-500 mt-1">
              {isPro ? 'Cap: Unlimited' : 'Cap: $15.00/mo (Free)'}
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-5">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-mono">REQUESTS PROCESSED</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">{stats.totalRequests}</div>
            <div className="text-[11px] text-zinc-500 mt-1">Real-time SSE proxy calls</div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-5">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-mono">LOOPS TERMINATED</span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-rose-400">{stats.loopsBlocked}</div>
            <div className="text-[11px] text-zinc-500 mt-1">Runaway loops killed</div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-5">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-mono">ESTIMATED SAVINGS</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">${stats.dollarsSaved.toFixed(2)}</div>
            <div className="text-[11px] text-zinc-500 mt-1">Saved from runaway loops</div>
          </div>
        </div>

        {/* API Key Generation & Drop-In Code */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-6 space-y-4">
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">Generate Protected Proxy Key</h3>
            </div>
            <p className="text-xs text-zinc-400">
              Input your upstream OpenAI API key. We encrypt it with AES-256 and issue a drop-in Circuit Breaker key. Your raw OpenAI key is never exposed.
            </p>

            {keyError && (
              <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded">
                {keyError}
              </div>
            )}

            <form onSubmit={handleGenerateKey} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">UPSTREAM OPENAI API KEY</label>
                <input
                  type="password"
                  required
                  value={upstreamKey}
                  onChange={(e) => setUpstreamKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={generatingKey}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-2 rounded text-xs font-mono transition flex items-center justify-center space-x-2"
              >
                {generatingKey ? (
                  <Activity className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Key className="w-3.5 h-3.5" />
                    <span>Generate Circuit Breaker Key</span>
                  </>
                )}
              </button>
            </form>

            {newKey && (
              <div className="mt-4 p-4 rounded bg-emerald-950/50 border border-emerald-700/80 space-y-2">
                <div className="flex items-center justify-between text-xs text-emerald-300 font-mono font-bold">
                  <span>YOUR NEW KEY (STORE THIS SECURELY):</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(newKey);
                      setCopiedKey(true);
                      setTimeout(() => setCopiedKey(false), 2000);
                    }}
                    className="text-emerald-400 hover:text-white flex items-center space-x-1"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? 'COPIED' : 'COPY'}</span>
                  </button>
                </div>
                <div className="font-mono text-xs break-all bg-zinc-950 p-2 rounded border border-emerald-900 text-emerald-400">
                  {newKey}
                </div>
              </div>
            )}

            <div className="pt-2">
              <h4 className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-2">Active Keys</h4>
              {keysList.length === 0 ? (
                <div className="text-xs text-zinc-600 font-mono">No keys generated yet.</div>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {keysList.map((k) => (
                    <div key={k.id} className="flex items-center justify-between text-xs font-mono bg-zinc-950 px-3 py-2 rounded border border-zinc-800/80">
                      <span className="text-zinc-300">{k.key_prefix}••••••••••••</span>
                      <span className="text-[10px] text-zinc-500">{new Date(k.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-white text-sm">Drop-In Integration</h3>
                </div>
                <button
                  onClick={() => {
                    const snippet = `from openai import OpenAI\n\n# 1-Line Circuit Breaker Drop-In\nclient = OpenAI(\n    base_url="http://localhost:8000/v1",\n    api_key="${newKey || 'cb_live_your_proxy_key'}"\n)`;
                    navigator.clipboard.writeText(snippet);
                    setCopiedSnippet(true);
                    setTimeout(() => setCopiedSnippet(false), 2000);
                  }}
                  className="text-xs font-mono text-zinc-400 hover:text-white flex items-center space-x-1"
                >
                  {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSnippet ? 'Copied' : 'Copy Snippet'}</span>
                </button>
              </div>
              <p className="text-xs text-zinc-400 mb-4">
                Works out of the box with LangChain, AutoGen, CrewAI, or direct OpenAI SDK:
              </p>

              <pre className="bg-zinc-950 p-4 rounded border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto">
                <span className="text-zinc-500">from</span> openai <span className="text-zinc-500">import</span> OpenAI{'\n\n'}
                <span className="text-zinc-500"># Point client to Circuit Breaker Proxy</span>{'\n'}
                client = OpenAI({'\n'}
                {'    '}base_url=<span className="text-emerald-400">"http://localhost:8000/v1"</span>,{'\n'}
                {'    '}api_key=<span className="text-emerald-400">"{newKey || 'cb_live_your_proxy_key'}"</span>{'\n'}
                ){'\n\n'}
                <span className="text-zinc-500"># Autonomous Agent calls continue identically:</span>{'\n'}
                response = client.chat.completions.create({'\n'}
                {'    '}model=<span className="text-emerald-400">"gpt-4o"</span>,{'\n'}
                {'    '}messages=[{`{"role": "user", "content": "Run recursive query"}`}],{'\n'}
                {'    '}stream=True{'\n'}
                )
              </pre>
            </div>

            <div className="mt-4 p-3 bg-zinc-950/80 rounded border border-zinc-800 text-[11px] font-mono text-zinc-400">
              💡 <strong>Instant Protection:</strong> All requests pass through with sub-50ms latency. If an infinite loop or budget cap is breached, the client receives an immediate HTTP 400/429.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}