import { PomodoroDashboard } from "@/components/pomodoro/pomodoro-dashboard";

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="flex items-center justify-center min-h-screen p-4">
        <PomodoroDashboard />
      </div>
    </main>
  );
}
