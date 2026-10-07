import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-[#0a0a0a]/90">
      <nav aria-label="Main navigation" className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-100">
          <ShieldAlert aria-hidden="true" className="h-[22px] w-[22px] text-sky-400" />
          <span className="flex flex-col">
            <span className="font-mono text-xs font-semibold tracking-tight">Shunt</span>
            <span className="text-[9px] text-zinc-500">The In-Memory LLM Firewall</span>
          </span>
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/docs" className="text-xs text-zinc-400 hover:text-white">Docs</Link>
          <Link href="/pricing" className="text-xs text-zinc-400 hover:text-white">Pricing</Link>
          <Link href="/login" className="text-xs text-zinc-400 hover:text-white">Sign In</Link>
          <Link href="/signup" className="rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-950 transition hover:bg-white">Get API Key</Link>
        </div>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 bg-[#0a0a0a]">
      <div className="mx-auto grid max-w-7xl gap-7 px-5 py-7 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-zinc-200">
            <ShieldAlert aria-hidden="true" className="h-4 w-4 text-sky-400" />
            Shunt
          </Link>
          <p className="mt-2 max-w-xs text-[11px] leading-4 text-zinc-500">The In-Memory LLM Firewall. Request-loop detection and spend controls for OpenAI-compatible agent traffic.</p>
        </div>
        <div>
          <h2 className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Service</h2>
          <p className="mt-2 inline-flex items-center gap-2 text-xs text-zinc-400">
            <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400 shadow-[0_0_8px_#38BDF8]" />
            Gateway status
          </p>
          <a href="mailto:contact.roandejager@gmail.com" className="mt-2 block text-xs text-zinc-500 hover:text-zinc-300">contact.roandejager@gmail.com</a>
        </div>
        <div>
          <h2 className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Resources</h2>
          <div className="mt-2 flex flex-col items-start gap-2 text-xs text-zinc-500">
            <Link href="/docs" className="hover:text-zinc-300">Documentation</Link>
            <Link href="/pricing" className="hover:text-zinc-300">Pricing</Link>
            <a href="/llms.txt" className="hover:text-zinc-300">llms.txt</a>
          </div>
        </div>
        <div>
          <h2 className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Company</h2>
          <div className="mt-2 flex flex-col items-start gap-2 text-xs text-zinc-500">
            <a href="https://github.com/roandejager/circuit-breaker" target="_blank" rel="noreferrer" className="hover:text-zinc-300">GitHub ↗</a>
            <Link href="/privacy" className="hover:text-zinc-300">Privacy</Link>
            <Link href="/terms" className="hover:text-zinc-300">Terms</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-zinc-800/80 px-5 py-3 text-center font-mono text-[10px] text-zinc-700 sm:px-8">
        © {new Date().getFullYear()} Shunt
      </div>
    </footer>
  );
}
