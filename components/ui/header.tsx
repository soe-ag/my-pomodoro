"use client";

import { usePathname, useRouter } from "next/navigation";
import { Settings, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const onToggle = () => {
    if (pathname === "/settings") {
      router.push("/");
    } else {
      router.push("/settings");
    }
  };

  const isSettings = pathname === "/settings";

  return (
    <header className="w-full">
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between py-6 px-4">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-time font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">
          POMODORO TIMER
        </h1>

        <div>
          <Button
            variant="ghost"
            onClick={onToggle}
            className={` bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-full px-4 py-2 shadow-lg transform transition hover:-translate-y-0.5 hover:scale-105`}
          >
            {isSettings ? (
              <Home className="w-4 h-4" />
            ) : (
              <Settings className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {isSettings ? "Home" : "Settings"}
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
