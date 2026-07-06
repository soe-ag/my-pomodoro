"use client";

import { SessionType } from "@/lib/pomodoro/constants";
import { getSessionTheme } from "@/lib/pomodoro/session-theme";
import { formatTime } from "@/lib/pomodoro/timer-logic";

interface TimerDisplayProps {
  timeRemaining: number;
  sessionType: SessionType;
  sessionDuration: number;
}

export function TimerDisplay({
  timeRemaining,
  sessionType,
  sessionDuration,
}: TimerDisplayProps) {
  const theme = getSessionTheme(sessionType);
  const progress =
    sessionDuration > 0
      ? Math.min(100, Math.max(0, ((sessionDuration - timeRemaining) / sessionDuration) * 100))
      : 0;

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div
        className={`inline-flex items-center rounded-full border px-4 py-1 text-xs font-medium uppercase tracking-[0.28em] ${theme.badgeClassName}`}
      >
        {theme.label}
      </div>

      <div className="text-center">
        <div
          className={`bg-linear-to-r ${theme.textClassName} bg-clip-text text-7xl font-semibold tracking-tight text-transparent sm:text-8xl lg:text-[7rem]`}
        >
          {formatTime(timeRemaining)}
        </div>
        <p className="mt-3 max-w-md text-sm text-slate-300 sm:text-base">
          {theme.description}
        </p>
      </div>

      <div className="w-full max-w-2xl rounded-full border border-white/10 bg-white/6 p-1.5">
        <div
          className={`h-3 rounded-full bg-linear-to-r ${theme.progressClassName} transition-[width] duration-300 ease-out`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
