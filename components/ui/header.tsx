"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const pathname = usePathname();
  const isSettings = pathname === "/settings";

  return (
    <header className="relative z-10 w-full border-b border-white/8 bg-slate-950/35 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="space-y-1">
          <div className="text-xs uppercase tracking-[0.32em] text-slate-400">Focused System</div>
          <h1 className="bg-linear-to-r from-rose-300 via-amber-100 to-sky-200 bg-clip-text text-2xl font-semibold tracking-tight text-transparent sm:text-3xl">
            My Pomodoro
          </h1>
        </Link>

        <Button
          asChild
          variant="outline"
          className="rounded-full border-white/12 bg-white/6 text-white hover:bg-white/10"
        >
          <Link href={isSettings ? "/" : "/settings"}>
            {isSettings ? <Home className="size-4" /> : <Settings2 className="size-4" />}
            {isSettings ? "Back to timer" : "Settings"}
          </Link>
        </Button>
      </div>
    </header>
  );
}
