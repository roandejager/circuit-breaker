const faqs = [
  {
    question: 'What latency does the gateway add?',
    answer: 'The proxy is designed for under 35ms of average overhead. Actual latency depends on network distance, provider response time, and deployment conditions.',
  },
  {
    question: 'Are prompts retained?',
    answer: 'Prompt bodies are processed for loop detection in memory and are not written to disk. Request metadata and usage logs do not include prompt text.',
  },
  {
    question: 'How are upstream API keys protected?',
    answer: 'Upstream credentials are encrypted with AES-256 (Fernet) before database insertion. Protected key material is hashed for lookup; raw upstream keys are not logged.',
  },
  {
    question: 'Which error codes can the gateway return?',
    answer: 'HTTP 400 indicates an infinite loop was stopped, HTTP 429 indicates a budget ceiling was reached, and HTTP 502 indicates an upstream provider error.',
  },
  {
    question: 'Which agent frameworks are compatible?',
    answer: 'Any client or framework that can send OpenAI-compatible requests to a custom base URL can use the gateway, including CrewAI, LangChain, LangGraph, AutoGen, and direct REST clients.',
  },
];

export function FaqAndPricing() {
  return (
    <section aria-labelledby="faq-heading" className="mt-16">
      <div className="mb-5">
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Implementation details</p>
        <h2 id="faq-heading" className="mt-2 text-2xl font-semibold text-white">Technical FAQs</h2>
      </div>
      <div className="divide-y divide-white/[0.08] rounded-md border border-white/[0.08] bg-[#0d0e12]">
        {faqs.map(({ question, answer }) => (
          <details key={question} className="group px-4 py-4">
            <summary className="cursor-pointer list-none text-sm font-medium text-zinc-200 marker:hidden focus-visible:outline focus-visible:outline-1 focus-visible:outline-emerald-600">
              <span className="flex items-center justify-between gap-4">
                {question}
                <span aria-hidden="true" className="font-mono text-zinc-500 group-open:rotate-45">+</span>
              </span>
            </summary>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
