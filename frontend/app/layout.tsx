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
      <body className="bg-zinc-950 text-zinc-100 antialiased selection:bg-emerald-500 selection:text-black">
        {children}
        <Analytics />
      </body>
    </html>
  );
}