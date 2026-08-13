import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/ui/header";
import { PomodoroProvider } from "@/lib/pomodoro/use-pomodoro";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "My Pomodoro",
  description:
    "A focused pomodoro timer with local stats, configurable sessions, and a refined interface.",
};

export const viewport: Viewport = {
  themeColor: "#020617",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scheme-dark" data-scroll-behavior="smooth">
      <body
        className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} min-h-screen overflow-x-clip bg-background font-sans text-foreground antialiased`}
      >
        <PomodoroProvider>
          <a
            href="#main-content"
            className="fixed left-4 top-4 z-50 -translate-y-24 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-xl transition-transform focus-visible:translate-y-0"
          >
            Skip to Content
          </a>
          <div
            aria-hidden="true"
            className="fixed inset-0 -z-10 overflow-hidden bg-[linear-gradient(180deg,#020617_0%,#0f172a_52%,#111827_100%)]"
          >
            <div className="absolute left-[8%] top-16 h-64 w-64 rounded-full bg-rose-500/14 blur-3xl" />
            <div className="absolute right-[10%] top-28 h-72 w-72 rounded-full bg-sky-500/12 blur-3xl" />
            <div className="absolute bottom-[-5%] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-300/8 blur-3xl" />
          </div>
          <Toaster />
          <Header />
          <main
            id="main-content"
            className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10"
          >
            {children}
          </main>
        </PomodoroProvider>
      </body>
    </html>
  );
}
