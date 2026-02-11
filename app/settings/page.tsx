"use client";

import { useRouter } from "next/navigation";
import SettingsPanel from "@/components/pomodoro/settings";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div
      className="w-full max-w-4xl mx-auto flex py-0 md:py-6 relative"
      style={{
        fontFamily: "ui-rounded, system-ui, -apple-system, 'Segoe UI', Roboto",
      }}
    >
      <SettingsPanel onClose={() => router.push("/")} />
    </div>
  );
}
