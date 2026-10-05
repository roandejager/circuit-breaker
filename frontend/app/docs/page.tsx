import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer, Navbar } from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Developer Documentation | AI Circuit Breaker',
  description: 'Configure the AI Circuit Breaker OpenAI-compatible proxy with Python, TypeScript, CrewAI, LangChain, LangGraph, AutoGen, or REST.',
};

const sections = [
  { id: 'quickstart', title: 'Quickstart' },
  { id: 'frameworks', title: 'Framework guides' },
  { id: 'errors', title: 'Error code protocol' },
  { id: 'security', title: 'Security & data handling' },
];

function CodeBlock({ title, children }: { title: string; children: string }) {
  return (
    <div className="overflow-hidden rounded-md border border-white/[0.08] bg-[#0d0e12]">
      <div className="border-b border-white/[0.08] px-4 py-2 font-mono text-[10px] uppercase tracking-wide text-zinc-500">{title}</div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-6 text-zinc-300"><code>{children}</code></pre>
    </div>
  );
}

export default function DocumentationPage() {
  return (
    <main className="min-h-screen bg-[#08090a] text-zinc-100">
      <Navbar />
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <nav aria-label="Breadcrumb" className="font-mono text-xs text-zinc-500">
          <Link href="/" className="hover:text-zinc-200">Home</Link>
          <span className="mx-2 text-zinc-700">/</span>
          <span aria-current="page" className="text-zinc-300">Documentation</span>
        </nav>
        <header className="py-10">
          <p className="font-mono text-xs uppercase tracking-widest text-emerald-400">Developer reference</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">Documentation</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">Route OpenAI-compatible requests through the gateway, configure agent frameworks, and handle protection responses.</p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[210px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-6 lg:h-fit">
            <nav aria-label="Documentation sections" className="rounded-md border border-white/[0.08] bg-[#0d0e12] p-3">
              <p className="px-2 py-2 font-mono text-[10px] uppercase tracking-widest text-zinc-600">On this page</p>
              {sections.map(({ id, title }) => (
                <a key={id} href={`#${id}`} className="block rounded px-2 py-2 text-xs text-zinc-400 hover:bg-zinc-900 hover:text-white">{title}</a>
              ))}
              <Link href="/pricing" className="mt-2 block border-t border-white/[0.08] px-2 pt-3 text-xs text-emerald-400 hover:text-emerald-300">Pricing details</Link>
            </nav>
          </aside>

          <div className="min-w-0 space-y-12">
            <section id="quickstart" className="scroll-mt-8 space-y-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">01 / Setup</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Quickstart</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">Create a protected key from the dashboard, then replace the client base URL and API key. The key shown below is a placeholder.</p>
              </div>
              <div className="grid gap-3 xl:grid-cols-2">
                <CodeBlock title="OpenAI Python">{`from openai import OpenAI\n\nclient = OpenAI(\n    base_url="https://circuit-breaker-api.onrender.com/v1",\n    api_key="cb_live_...",\n)\n\nresponse = client.chat.completions.create(\n    model="gpt-4o-mini",\n    messages=[{"role": "user", "content": "Hello"}],\n)`}</CodeBlock>
                <CodeBlock title="OpenAI TypeScript">{`import OpenAI from "openai";\n\nconst client = new OpenAI({\n  baseURL: "https://circuit-breaker-api.onrender.com/v1",\n  apiKey: "cb_live_...",\n});\n\nconst response = await client.chat.completions.create({\n  model: "gpt-4o-mini",\n  messages: [{ role: "user", content: "Hello" }],\n});`}</CodeBlock>
              </div>
            </section>

            <section id="frameworks" className="scroll-mt-8 space-y-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">02 / Integrations</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Framework guides</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">Set the framework&apos;s OpenAI-compatible endpoint to the gateway and provide a protected Circuit Breaker key.</p>
              </div>
              <div className="space-y-3">
                <CodeBlock title="CrewAI · Python">{`import os\nfrom crewai import LLM, Agent\n\nllm = LLM(\n    model="openai/gpt-4o-mini",\n    base_url="https://circuit-breaker-api.onrender.com/v1",\n    api_key=os.environ["CIRCUIT_BREAKER_API_KEY"],\n)\n\nresearcher = Agent(\n    role="Research analyst",\n    goal="Answer the assigned research question",\n    backstory="A careful technical researcher.",\n    llm=llm,\n)`}</CodeBlock>
                <CodeBlock title="LangChain / LangGraph · Python">{`import os\nfrom langchain_openai import ChatOpenAI\n\nllm = ChatOpenAI(\n    model="gpt-4o-mini",\n    base_url="https://circuit-breaker-api.onrender.com/v1",\n    api_key=os.environ["CIRCUIT_BREAKER_API_KEY"],\n)\n\n# Use llm.invoke(...) directly or bind it to a LangGraph node.`}</CodeBlock>
                <CodeBlock title="AutoGen · Python">{`import os\nfrom autogen import AssistantAgent\n\nconfig_list = [{\n    "model": "gpt-4o-mini",\n    "api_type": "openai",\n    "base_url": "https://circuit-breaker-api.onrender.com/v1",\n    "api_key": os.environ["CIRCUIT_BREAKER_API_KEY"],\n}]\n\nassistant = AssistantAgent(\n    name="assistant",\n    llm_config={"config_list": config_list},\n)`}</CodeBlock>
                <CodeBlock title="cURL / REST API">{`curl https://circuit-breaker-api.onrender.com/v1/chat/completions -H "Authorization: Bearer cb_live_..." -H "Content-Type: application/json" -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Hello"}],"stream":false}'`}</CodeBlock>
              </div>
              <div className="rounded border border-white/[0.08] bg-[#0d0e12] p-4 text-xs leading-5 text-zinc-500">
                Send requests to <code className="font-mono text-zinc-300">/v1/chat/completions</code>. Include the protected key as a bearer token and send an OpenAI-compatible JSON body with at least a model and messages field. Do not embed upstream provider keys in client-side applications.
              </div>
            </section>

            <section id="errors" className="scroll-mt-8 space-y-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">03 / Responses</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Error code protocol</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">A blocked request includes a machine-readable code in its JSON error body.</p>
              </div>
              <div className="overflow-x-auto rounded-md border border-white/[0.08] bg-[#0d0e12]">
                <table className="w-full min-w-[620px] text-left text-xs">
                  <thead className="border-b border-white/[0.08] font-mono uppercase tracking-wide text-zinc-500">
                    <tr><th className="px-4 py-3 font-normal">HTTP</th><th className="px-4 py-3 font-normal">Error code</th><th className="px-4 py-3 font-normal">Meaning</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    <tr className="hover:bg-zinc-900/50"><td className="px-4 py-3 font-mono text-rose-300">400</td><td className="px-4 py-3 font-mono text-zinc-200">infinite_loop_killed</td><td className="px-4 py-3 text-zinc-400">Prompt repetition threshold exceeded; the loop request was stopped.</td></tr>
                    <tr className="hover:bg-zinc-900/50"><td className="px-4 py-3 font-mono text-amber-300">429</td><td className="px-4 py-3 font-mono text-zinc-200">budget_limit_breached</td><td className="px-4 py-3 text-zinc-400">Hourly or daily dollar ceiling reached.</td></tr>
                    <tr className="hover:bg-zinc-900/50"><td className="px-4 py-3 font-mono text-zinc-300">502</td><td className="px-4 py-3 font-mono text-zinc-200">upstream_error</td><td className="px-4 py-3 text-zinc-400">Upstream provider is unreachable or timed out.</td></tr>
                  </tbody>
                </table>
              </div>
              <CodeBlock title="Error response example">{`{\n  "error": {\n    "message": "Request blocked by Circuit Breaker",\n    "type": "circuit_breaker_loop_detected",\n    "code": "infinite_loop_killed"\n  }\n}`}</CodeBlock>
            </section>

            <section id="security" className="scroll-mt-8 space-y-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">04 / Data handling</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Security &amp; zero-payload architecture</h2>
              </div>
              <div className="rounded-md border border-white/[0.08] bg-[#0d0e12]">
                <div className="grid divide-y divide-white/[0.08] sm:grid-cols-2 sm:divide-y-0">
                  {[
                    ['Upstream credentials', 'Encrypted at rest with AES-256 (Fernet) before database insertion.'],
                    ['Protected key lookup', 'SHA-256 key hashing is used for lookup; full protected secrets are shown once.'],
                    ['Prompt bodies', 'Used in memory for loop detection and not written to disk.'],
                    ['Request logs', 'Usage and operational metadata are recorded; prompt text is not part of the request log schema.'],
                  ].map(([title, description]) => (
                    <div key={title} className="border-white/[0.08] p-4 sm:border-r even:border-r-0">
                      <h3 className="text-sm font-medium text-zinc-200">{title}</h3>
                      <p className="mt-2 text-xs leading-5 text-zinc-500">{description}</p>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[11px] leading-5 text-zinc-600">Do not send sensitive prompt data unless your organization&apos;s data handling requirements permit processing by the configured model provider.</p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
