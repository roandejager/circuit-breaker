import Link from 'next/link';
import { ArrowLeft, Terminal } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-300 font-mono flex flex-col items-center justify-center px-6 selection:bg-zinc-800 selection:text-white">
      <div className="max-w-md w-full border border-zinc-800 bg-zinc-950 p-8 rounded-lg space-y-6">
        <div className="flex items-center space-x-2 text-zinc-500 text-xs border-b border-zinc-800 pb-3">
          <Terminal className="w-4 h-4 text-zinc-500" />
          <span>GATEWAY ERROR // 404</span>
        </div>

        <div>
          <h1 className="text-xl font-bold text-white mb-2">Resource Not Found</h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            The requested route does not exist on this server or proxy gateway. Check the URL for typographical errors.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center space-x-2 bg-zinc-100 hover:bg-white text-zinc-950 font-bold px-4 py-2 rounded text-xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Link>

          <a
            href="https://circuit-breaker-api.onrender.com/health"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white px-4 py-2 rounded text-xs transition"
          >
            <span>API Status</span>
          </a>
        </div>
      </div>
    </div>
  );
}