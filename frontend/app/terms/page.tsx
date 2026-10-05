import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | AI Circuit Breaker',
  description: 'Terms and conditions for using the AI Circuit Breaker reverse proxy and dashboard.',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-300 font-sans selection:bg-zinc-800 selection:text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link 
          href="/" 
          className="inline-flex items-center space-x-2 text-xs font-mono text-zinc-500 hover:text-white transition mb-12"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Circuit Breaker</span>
        </Link>

        <div className="flex items-center space-x-3 mb-6">
          <FileText className="w-6 h-6 text-zinc-100" />
          <h1 className="text-3xl font-bold tracking-tight text-white">Terms of Service</h1>
        </div>
        <p className="text-xs font-mono text-zinc-500 mb-10">Last updated: October 5, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-zinc-400">
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">1. Agreement to Terms</h2>
            <p>
              By creating an account or routing API requests through AI Circuit Breaker (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, you must immediately cease all use of the proxy and dashboard.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">2. Nature of Service & Limitation of Liability</h2>
            <p>
              AI Circuit Breaker is an automated proxy firewall designed to identify recursive request loops and enforce client-configured budget caps. 
              While we use deterministic sliding-window hashing to intercept loops, <strong>you remain ultimately responsible for all charges incurred on your third-party provider accounts (e.g. OpenAI, Anthropic).</strong>
            </p>
            <p>
              In no event shall AI Circuit Breaker or its operators be liable for any indirect, incidental, or consequential damages, including model provider overages, service interruptions, or upstream provider downtime.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">3. Acceptable Use</h2>
            <p>
              You agree not to use the Service to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Conduct Distributed Denial of Service (DDoS) attacks or deliberately saturate upstream APIs.</li>
              <li>Attempt to reverse-engineer or circumvent proxy authentication mechanisms.</li>
              <li>Route content that violates the terms and usage policies of the upstream model provider.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">4. Subscriptions & Billing</h2>
            <p>
              Free accounts are limited to $15.00/month in monitored upstream LLM spend. Pro accounts are billed at $29.00/month recurring. 
              Billing is managed by Polar Software Inc. acting as Merchant of Record. Subscriptions can be canceled at any time via the customer billing portal.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">5. Refund Policy</h2>
            <p>
              If you are dissatisfied with the Service, you may request a full refund within 14 days of your initial purchase by contacting support. Refunds are processed automatically through Polar.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">6. Operator Contact</h2>
            <p>
              The Service is operated independently. For legal or commercial inquiries:
            </p>
            <p className="font-mono text-xs text-zinc-200 bg-zinc-900/60 p-3 rounded border border-zinc-800">
              contact.roandejager@gmail.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}