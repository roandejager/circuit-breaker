import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-[#0a0a0a]/90">
      <nav aria-label="Main navigation" className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
        <Link href="/" className="inline-flex min-w-0 items-center gap-2 text-zinc-100">
          <ShieldAlert aria-hidden="true" className="h-4 w-4 shrink-0 text-zinc-300" />
          <span className="flex flex-col">
            <span className="font-mono text-xs font-semibold tracking-tight">Shunt</span>
            <span className="hidden text-xs text-zinc-400 sm:block">The In-Memory LLM Firewall</span>
          </span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/docs" className="text-xs text-zinc-300 transition-colors duration-150 ease-out hover:text-sky-400">Docs</Link>
          <Link href="/pricing" className="text-xs text-zinc-300 transition-colors duration-150 ease-out hover:text-sky-400">Pricing</Link>
          <Link href="/login" className="text-xs text-zinc-300 transition-colors duration-150 ease-out hover:text-sky-400">Sign In</Link>
          <Link href="/signup" className="rounded-md bg-sky-400 px-3 py-2 text-xs font-medium text-zinc-950 transition-colors duration-150 ease-out hover:bg-sky-300">Get API Key</Link>
        </div>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 bg-[#0a0a0a]">
      <div className="mx-auto grid max-w-[1200px] grid-cols-12 gap-6 px-4 py-8 sm:px-6">
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <Link href="/" className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-zinc-200">
            <ShieldAlert aria-hidden="true" className="h-4 w-4 text-zinc-300" />
            Shunt
          </Link>
          <p className="mt-2 max-w-xs text-xs leading-[1.5] text-zinc-400">The In-Memory LLM Firewall. Request-loop detection and spend controls for OpenAI-compatible agent traffic.</p>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <h2 className="font-mono text-xs uppercase tracking-wider text-zinc-400">Service</h2>
          <p className="mt-2 inline-flex items-center gap-2 text-xs text-zinc-300">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38BDF8]" />
            Gateway status
          </p>
          <a href="mailto:contact.roandejager@gmail.com" className="mt-2 block text-xs text-zinc-400 transition-colors duration-150 ease-out hover:text-sky-400">contact.roandejager@gmail.com</a>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <h2 className="font-mono text-xs uppercase tracking-wider text-zinc-400">Resources</h2>
          <div className="mt-2 flex flex-col items-start gap-2 text-xs text-zinc-400">
            <Link href="/docs" className="transition-colors duration-150 ease-out hover:text-sky-400">Documentation</Link>
            <Link href="/pricing" className="transition-colors duration-150 ease-out hover:text-sky-400">Pricing</Link>
            <a href="/llms.txt" className="transition-colors duration-150 ease-out hover:text-sky-400">llms.txt</a>
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <h2 className="font-mono text-xs uppercase tracking-wider text-zinc-400">Company</h2>
          <div className="mt-2 flex flex-col items-start gap-2 text-xs text-zinc-400">
            <a href="https://github.com/roandejager/shunt" target="_blank" rel="noreferrer" className="transition-colors duration-150 ease-out hover:text-sky-400">GitHub ↗</a>
            <Link href="/privacy" className="transition-colors duration-150 ease-out hover:text-sky-400">Privacy</Link>
            <Link href="/terms" className="transition-colors duration-150 ease-out hover:text-sky-400">Terms</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-zinc-800/80 px-4 py-3 text-center font-mono text-xs text-zinc-400 sm:px-6">
        © {new Date().getFullYear()} Shunt
      </div>
    </footer>
  );
}
