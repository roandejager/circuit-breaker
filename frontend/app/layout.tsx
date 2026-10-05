import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "AI Circuit Breaker | LLM Loop & Cost Firewall",
  description: "Drop-in reverse proxy that stops runaway infinite loops and budget overruns in autonomous AI agents with one line of code.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090a0f] bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] text-zinc-200 antialiased selection:bg-zinc-600 selection:text-white">
        {children}
        <Analytics />
      </body>
    </html>
  );
}