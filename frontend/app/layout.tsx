import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Shunt | The In-Memory LLM Firewall",
  description: "Shunt is an in-memory LLM firewall that stops recursive agent loops and enforces spend caps without retaining prompt payloads.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}