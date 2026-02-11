"use client";

import { formatTime } from "@/lib/pomodoro/timer-logic";
import { SessionType } from "@/lib/pomodoro/constants";

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
  const progress = ((sessionDuration - timeRemaining) / sessionDuration) * 100;

  const gradientFor = (type: SessionType) => {
    switch (type) {
      case "work":
        return "from-blue-600 to-purple-600";
      case "break":
        return "from-emerald-500 to-green-600";
      case "long-break":
        return "from-blue-400 to-blue-400";
      default:
        return "from-blue-600 to-purple-600";
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex items-center justify-center">
        <div
          className={`text-center text-8xl md:text-9xl lg:text-[7rem] font-time font-extrabold leading-none text-transparent bg-clip-text bg-linear-to-r ${gradientFor(sessionType)}`}
        >
          {formatTime(timeRemaining)}
        </div>
      </div>

      <div className="w-full mt-6 bg-gray-200/20 dark:bg-white/5 rounded-full h-4 overflow-hidden">
        <div
          className={`h-4 rounded-full transition-width duration-200 bg-linear-to-r ${sessionType === "work" ? "from-blue-600 to-purple-600" : sessionType === "break" ? "from-emerald-500 to-green-600" : "from-blue-400 to-blue-400"}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
