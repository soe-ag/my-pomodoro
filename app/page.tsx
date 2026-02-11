import { PomodoroDashboard } from "@/components/pomodoro/pomodoro-dashboard";

export default function Page() {
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-time font-extrabold text-transparent bg-clip-text bg-linear-to-r p-2 from-blue-600 to-purple-600">
        POMODORO TIMER
      </h2>
      <div className="flex items-center justify-center p-4">
        <PomodoroDashboard />
      </div>
    </main>
  );
}
