import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { FaqAndPricing } from '@/components/FaqAndPricing';
import { Footer, Navbar } from '@/components/Navigation';
import { LoopSavingsCalculator } from '@/components/LoopSavingsCalculator';

export const metadata: Metadata = {
  title: 'Pricing & ROI | Shunt',
  description: 'Compare Shunt Free and Pro tiers, estimate avoided loop spend, and review gateway limits.',
};

const polarCheckoutUrl = 'https://buy.polar.sh/polar_cl_4jPE6jEIy8EMhcJJX28OwVF3RFFLv0uFsc9Mv1Hgayd';

const freeFeatures = [
  'Up to $15/mo monitored spend',
  '3× sliding-window loop detection',
  'Hourly and daily budget caps',
  'OpenAI-compatible proxy endpoint',
];

const proFeatures = [
  'Unlimited monitored spend',
  '$50/hr and $200/day burst ceilings',
  'Emergency Slack and Discord webhooks',
  'Priority European routing',
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      <Navbar />
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <nav aria-label="Breadcrumb" className="font-mono text-xs text-zinc-500">
          <Link href="/" className="hover:text-zinc-200">Home</Link>
          <span className="mx-2 text-zinc-700">/</span>
          <span aria-current="page" className="text-zinc-300">Pricing</span>
        </nav>
        <header className="max-w-3xl py-12">
          <p className="font-mono text-[11px] text-zinc-500">GATEWAY // PRICING &amp; LIMITS</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Limits that match your workload.</h1>
          <p className="mt-3 text-xs leading-5 text-zinc-400">Start without a subscription and move to production controls when you need higher ceilings.</p>
        </header>

        <LoopSavingsCalculator />

        <section aria-label="Pricing plans" className="mt-8 grid gap-4 lg:grid-cols-2">
          <article className="flex flex-col rounded-md border border-white/[0.08] bg-[#0d0e12] transition-colors hover:border-sky-500/40">
            <div className="border-b border-white/[0.08] p-5 sm:p-6">
              <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Developer</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Free</h2>
              <p className="mt-4 font-mono text-3xl text-white">$0<span className="ml-1 text-sm text-zinc-500">/mo</span></p>
              <p className="mt-2 text-sm text-zinc-400">For development and initial workloads.</p>
            </div>
            <ul className="flex-1 space-y-3 p-5 sm:p-6">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex gap-2 text-sm text-zinc-300">
                  <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />{feature}
                </li>
              ))}
            </ul>
            <div className="p-5 pt-0 sm:p-6 sm:pt-0">
              <Link href="/signup" className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-zinc-700 px-4 py-2.5 text-sm text-zinc-100 hover:bg-zinc-900">
                Start Free <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </article>

          <article className="flex flex-col rounded-md border border-white/[0.08] bg-[#0d0e12] transition-colors hover:border-sky-500/40">
            <div className="border-b border-white/[0.08] p-5 sm:p-6">
              <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Production</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Pro</h2>
              <p className="mt-4 font-mono text-3xl text-white">$29<span className="ml-1 text-sm text-zinc-500">/mo</span></p>
              <p className="mt-2 text-sm text-zinc-400">For production agents that need higher budget ceilings.</p>
            </div>
            <ul className="flex-1 space-y-3 p-5 sm:p-6">
              {proFeatures.map((feature) => (
                <li key={feature} className="flex gap-2 text-sm text-zinc-300">
                  <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />{feature}
                </li>
              ))}
            </ul>
            <div className="p-5 pt-0 sm:p-6 sm:pt-0">
              <a href={polarCheckoutUrl} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-zinc-100 px-4 py-2 text-xs font-medium text-zinc-950 shadow-sm transition hover:bg-white">
                Upgrade to Pro ($29/mo) <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </a>
            </div>
          </article>
        </section>

        <div className="mt-5 flex items-start gap-2 rounded border border-white/[0.08] bg-[#0d0e12] p-4 text-xs leading-5 text-zinc-500">
          <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
          Spend ceilings are enforced by the gateway using account configuration. Review actual limits and usage in your dashboard before routing production traffic.
        </div>

        <FaqAndPricing />
      </div>
      <Footer />
    </main>
  );
}
