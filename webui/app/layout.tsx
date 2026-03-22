import type { Metadata } from "next";
import { Geist_Mono, IBM_Plex_Sans } from "next/font/google";
import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
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
        className={`${ibmPlexSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 md:px-8">
          <header className="sofa-z-index-navbar mb-6">
            <div className="flex items-center justify-between gap-4">
              <Link
                href="/memories"
                className="text-lg font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
              >
                Agent Memory
              </Link>
              <nav className="flex items-center gap-1 sm:gap-2">
                <Link
                  href="/memories"
                  className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Memories
                </Link>
                <Link
                  href="/config"
                  className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Configuration
                </Link>
              </nav>
            </div>
            <Separator decorative className="mt-5" />
          </header>
          <main className="sf-scrollbar min-h-0 flex-1 overflow-y-auto pb-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
