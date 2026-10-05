import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

const links = [
  { label: 'Documentation', href: '/docs' },
  { label: 'Pricing', href: '/pricing' },
];

export function Navbar() {
  return (
    <header className="border-b border-white/[0.08] bg-[#0a0b0e]">
      <nav aria-label="Main navigation" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-white">
          <ShieldAlert aria-hidden="true" className="h-5 w-5 text-emerald-400" />
          AI Circuit Breaker
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          {links.map(({ label, href }) => (
            <Link key={href} href={href} className="text-xs text-zinc-400 hover:text-white sm:text-sm">{label}</Link>
          ))}
          <Link href="/login" className="hidden text-xs text-zinc-400 hover:text-white sm:inline sm:text-sm">Sign in</Link>
          <Link href="/signup" className="rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-100 hover:bg-zinc-900 sm:text-sm">Create account</Link>
        </div>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#0a0b0e]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Link href="/" className="font-mono text-zinc-400 hover:text-white">AI Circuit Breaker</Link>
        <nav aria-label="Footer navigation" className="flex gap-5">
          <Link href="/docs" className="hover:text-zinc-200">Documentation</Link>
          <Link href="/pricing" className="hover:text-zinc-200">Pricing</Link>
          <Link href="/login" className="hover:text-zinc-200">Sign in</Link>
        </nav>
      </div>
    </footer>
  );
}
