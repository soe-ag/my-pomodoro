"use client";

import { formatTime } from "@/lib/pomodoro/timer-logic";
import { getSessionLabel } from "@/lib/pomodoro/timer-logic";
import { SessionType } from "@/lib/pomodoro/constants";

interface TimerDisplayProps {
  timeRemaining: number;
  sessionType: SessionType;
  sessionsCompleted: number;
  isRunning: boolean;
  sessionDuration: number;
}

export function TimerDisplay({
  timeRemaining,
  sessionType,
  sessionsCompleted,
  isRunning,
  sessionDuration,
}: TimerDisplayProps) {
  const displayTime = formatTime(timeRemaining);
  const sessionLabel = getSessionLabel(sessionType);

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      {/* Session Badge */}
      <div className="inline-block px-4 py-2 rounded-full bg-linear-to-r from-blue-500 to-purple-600 text-white font-semibold text-sm">
        {sessionLabel}
      </div>

      {/* Main Timer Display */}
      <div
        className={`text-center transition-all duration-300 ${
          isRunning ? "animate-pulse" : ""
        }`}
      >
        <div className="text-7xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600 tabular-nums">
          {displayTime}
        </div>
      </div>

      {/* Session Counter */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Sessions completed today:{" "}
        <span className="font-semibold">{sessionsCompleted}</span>
      </div>

      {/* Status Indicator */}
      <div className="h-1 w-32 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-linear-to-r from-blue-500 to-purple-600 transition-all duration-300"
          style={{
            width: `${
              sessionDuration > 0
                ? Math.min(
                    100,
                    Math.max(
                      0,
                      ((sessionDuration - timeRemaining) / sessionDuration) *
                        100,
                    ),
                  )
                : 0
            }%`,
          }}
        />
      </div>
    </div>
  );
}
