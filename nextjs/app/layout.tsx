import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agent Memory Web UI",
  description: "Local Next.js Web UI for Agent Memory",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 md:px-8">
          <header className="mb-4">
            <div className="flex items-center justify-between">
              <Link
                href="/memories"
                className="text-lg font-semibold tracking-tight"
              >
                Agent Memory
              </Link>
              <nav className="flex items-center gap-5 text-sm">
                <Link
                  href="/memories"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Memories
                </Link>
                <Link
                  href="/config"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Configuration
                </Link>
              </nav>
            </div>
            <Separator decorative className="mt-4" />
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
