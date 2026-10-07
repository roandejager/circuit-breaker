import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Shunt',
  description: 'How Shunt handles API credentials, encryption, and request metadata.',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans selection:bg-zinc-800 selection:text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link 
          href="/" 
          className="inline-flex items-center space-x-2 text-xs font-mono text-zinc-500 hover:text-white transition mb-12"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Shunt</span>
        </Link>

        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-6 h-6 text-zinc-100" />
          <h1 className="text-3xl font-bold tracking-tight text-white">Privacy Policy</h1>
        </div>
        <p className="text-xs font-mono text-zinc-500 mb-10">Last updated: October 5, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-zinc-400">
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">1. Core Philosophy: Zero-Payload Retention</h2>
            <p>
              Shunt operates as an in-line reverse proxy. We believe in strict data minimization.
              <strong> We do not store, log, or train on the text contents of your prompts or completions.</strong> 
              Request payloads are parsed in volatile memory solely to calculate prompt hashes for recursion detection and token counts for cost caps, then immediately streamed through to the upstream model provider.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">2. Information We Store</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-zinc-200">Account Credentials:</strong> Your email address and hashed passwords, managed via Supabase Auth.
              </li>
              <li>
                <strong className="text-zinc-200">Upstream API Keys:</strong> In Zero-Trust Mode, provider keys sent in <code className="font-mono">x-upstream-key</code> are processed in request memory and are not stored. If you choose Vault Mode, keys are encrypted using AES-256 (Fernet) before storage.
              </li>
              <li>
                <strong className="text-zinc-200">Shunt API Keys:</strong> Proxy keys issued to you are hashed with SHA-256. Only the hash and an 8-character prefix are stored.
              </li>
              <li>
                <strong className="text-zinc-200">Operational Metadata:</strong> We log request metadata for billing and dashboard reporting: timestamp, session identifier, model name, token usage counts, calculated cost, HTTP status code, and whether a Shunt rule terminated the request.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">3. Cookieless Analytics</h2>
            <p>
              Our website uses Vercel Web Analytics. We do not use third-party tracking cookies or advertising pixels. All telemetry is aggregated and privacy-friendly, fully compliant with GDPR without requiring invasive cookie consent banners.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">4. Payment Processing (Merchant of Record)</h2>
            <p>
              Paid subscriptions are billed through <strong>Polar Software Inc.</strong>, acting as our Merchant of Record. Polar handles all payment transactions, invoicing, and applicable EU/Norwegian VAT. We do not store or process your credit card numbers or banking credentials.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">5. Contact & Data Deletion</h2>
            <p>
              You have the right to inspect, export, or permanently delete your account and all associated keys. For privacy inquiries or immediate account purge requests, contact:
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