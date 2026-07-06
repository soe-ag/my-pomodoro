"use client";

import { useRouter } from "next/navigation";
import SettingsPanel from "@/components/pomodoro/settings";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="w-full">
      <SettingsPanel onClose={() => router.push("/")} />
    </div>
  );
}
